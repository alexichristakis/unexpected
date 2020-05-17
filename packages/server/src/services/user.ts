import { $log, Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Document } from "mongoose";
import moment from "moment";
import _ from "lodash";

import {
  NewUser,
  PartialUser,
  User,
  UserModel,
  UserNotificationRecord,
  DefaultUserSelect,
  CompleteUserSchemaFields,
} from "@global";
import { NOTIFICATION_MINUTES } from "../lib/constants";
import { SlackLogService } from "./logger";
import { NotificationService } from "./notification";

@Service()
export class UserService {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  @Inject(SlackLogService)
  logger: SlackLogService;

  @Inject(NotificationService)
  notificationService: NotificationService;

  async createPlaceholder(phone: string) {
    return this.model.create({ phoneNumber: phone, placeholder: true });
  }

  async createFullUser(id: string, newData: NewUser) {
    const user = await this.model.findById(id);

    if (!user || !user.placeholder) {
      return null;
    }

    // update with name, OS, timezone
    user.update({ ...newData, placeholder: false });

    // create
    const [createdUser] = await Promise.all([
      user.save(),
      this.logger.sendMessage(
        "new user",
        `${newData.firstName} ${newData.lastName}`
      ),
    ]);

    return createdUser;
  }

  async get(
    uid: string,
    select: string = DefaultUserSelect,
    populate?: string
  ) {
    return this.model.findById(uid).select(select).populate(populate).exec();
  }

  async getMultiple(
    uids: string[],
    select: string = DefaultUserSelect,
    populate?: string
  ) {
    return this.model
      .find({ _id: { $in: uids } })
      .select(select)
      .populate(populate)
      .exec();
  }

  async getAll(select?: string, populate?: string) {
    return this.model.find().select(select).populate(populate).exec();
  }

  async search(query: string) {
    if (query.match(/^[2-9]\d{2}\d{3}\d{4}$/)) {
      return this.model.find({ phoneNumber: new RegExp(query) }).exec();
    } else {
      const [firstName, lastName] = query.split(" ");

      return this.model
        .find({
          firstName: new RegExp(firstName, "i"),
          lastName: new RegExp(lastName, "i"),
        })
        .exec();
    }
  }

  async update(id: string, newData: Partial<User>) {
    const user = await this.model
      .findById(id)
      .select(CompleteUserSchemaFields)
      .exec();

    if (!user) return null;

    user.set(newData);
    return user.save() as Promise<User>;
  }

  async updateValidNotifications(userId: string) {
    const time = moment();
    const user = await this.model
      .findById(userId)
      .select("notifications")
      .exec();

    if (!user) return;

    const { notifications } = user;
    const updatedNotifications = notifications.filter(
      (notification) =>
        !time.isBetween(
          notification,
          moment(notification).add(NOTIFICATION_MINUTES, "minutes")
        )
    );

    return this.model.updateOne(
      { _id: userId },
      { notifications: updatedNotifications }
    );
  }

  async cameraEnabled(phoneNumber: string) {
    const user = await this.model
      .findOne({ phoneNumber })
      .select("notifications")
      .exec();

    if (!user) return { enabled: false };

    const { notifications } = user;

    const currentTime = moment();

    const payload = { enabled: false, start: "" };

    notifications.forEach((notification) => {
      const start = moment(notification);
      const end = start.clone().add(NOTIFICATION_MINUTES, "minutes");

      if (currentTime.isBetween(start, end, undefined, "[]")) {
        payload.enabled = true;
        payload.start = start.toISOString();
      }
    });

    return payload;
  }

  async setNotificationTimes(times: UserNotificationRecord[]) {
    const res = await this.model.bulkWrite(
      times.map(({ _id, notifications }) => ({
        updateOne: {
          filter: { _id },
          update: { $set: { notifications } },
        },
      }))
    );

    $log.info(res);
  }

  async unfriend(a: string, b: string) {
    const users = await this.getMultiple([a, b], "_id friends");

    const [user1] = users.filter(({ _id }) => _id.toString() === a);
    const [user2] = users.filter(({ _id }) => _id.toString() === b);

    return this.model.bulkWrite([
      {
        updateOne: {
          filter: { _id: a },
          update: {
            $set: { friends: user1.friends.filter((user) => user !== b) },
          },
        },
      },
      {
        updateOne: {
          filter: { _id: b },
          update: {
            $set: { friends: user2.friends.filter((user) => user !== a) },
          },
        },
      },
    ]);
  }

  async friend(from: User, to: User) {
    return Promise.all([
      this.model.bulkWrite([
        {
          updateOne: {
            filter: { _id: from.id },
            update: { $set: { friends: _.uniq([...from.friends, to._id]) } },
          },
        },
        {
          updateOne: {
            filter: { _id: to.id },
            update: { $set: { friends: _.uniq([...to.friends, from._id]) } },
          },
        },
      ]),
      this.notificationService.notifyWithNavigationToUser(
        from,
        `${to.firstName} ${to.lastName} accepted your friend request.`,
        to
      ),
    ]);
  }

  async getFriends(uid: string) {
    const user = await this.model
      .findById(uid)
      .select("friends")
      .populate("friends", DefaultUserSelect)
      .lean()
      .exec();

    if (!user) return null;

    const { friends } = user as any;

    const ret = friends.map(({ _id, ...rest }: UserModel) => ({
      id: _id,
      ...rest,
    }));

    return ret as PartialUser[];
  }

  async getByPhone(phoneNumber?: string): Promise<User & Document>;
  async getByPhone(
    phoneNumbers: string[],
    sort?: boolean,
    select?: string
  ): Promise<(User & Document)[]>;
  async getByPhone(
    phoneNumber?: string | string[],
    sort?: boolean,
    select?: string
  ) {
    if (phoneNumber instanceof Array) {
      const users = await this.model
        .find({
          phoneNumber: { $in: phoneNumber },
        })
        // .select(select)
        .exec();

      if (sort) {
        return users.sort((a, b) =>
          phoneNumber.indexOf(a.phoneNumber) >
          phoneNumber.indexOf(b.phoneNumber)
            ? 1
            : -1
        );
      }

      return users;
    }

    return this.model.findOne({ phoneNumber }).exec();
  }
}
