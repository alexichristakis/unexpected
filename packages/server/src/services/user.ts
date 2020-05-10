import { $log, Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import _ from "lodash";
import moment from "moment";
import { Document } from "mongoose";

import {
  UserModel,
  Post,
  User,
  UserNotificationRecord,
  NewUser,
  NewPost,
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

  async create(newUser: NewUser) {
    const user = await this.getByPhone(newUser.phoneNumber);

    // if a user has already been created under this phone
    if (user) return user;

    // create
    const [createdUser] = await Promise.all([
      this.model.create(newUser),
      this.logger.sendMessage(
        "new user",
        `${newUser.firstName} ${newUser.lastName}`
      ),
    ]);

    return createdUser;
  }

  async get(uid: string, select?: string, populate?: string) {
    return this.model.findById(uid).select(select).populate(populate).exec();
  }

  async getMultiple(uids: string[], select?: string, populate?: string) {
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
    const user = await this.model.findById(id).exec();

    if (!user) return null;

    user.update(newData);

    return user.save() as Promise<User>;
  }

  async updateValidNotifications(post: NewPost) {
    const { user: uid } = post;

    const time = moment();
    const user = await this.model
      .findById(uid.toString())
      .select("notifications")
      .exec();
    // const user = await this.findOne({  }, ["notifications"]);

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
      { _id: uid.toString() },
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

  async unfriend(from: string, to: string) {
    const [userFrom, userTo] = await this.getByPhone([from, to], true);

    await Promise.all([
      this.model
        .updateOne(
          { phoneNumber: to },
          {
            friends: userTo.friends.filter((user) => user !== from),
          }
        )
        .exec(),
      this.model
        .updateOne(
          { phoneNumber: from },
          {
            friends: userFrom.friends.filter((user) => user !== to),
          }
        )
        .exec(),
    ]);
  }

  async friend(from: User, to: User) {
    const res = await Promise.all([
      this.model.bulkWrite([
        {
          updateOne: {
            filter: { _id: from._id },
            update: { $set: { friends: _.uniq([...from.friends, to._id]) } },
          },
        },
        {
          updateOne: {
            filter: { _id: to._id },
            update: { $set: { friends: _.uniq([...to.friends, from._id]) } },
          },
        },
      ]),
      this.notificationService.notifyWithNavigationToUser(
        from,
        `${from.firstName} ${from.lastName} accepted your friend request.`,
        from
      ),
    ]);

    $log.info(res);
  }

  async getFriends(uid: string) {
    const user = await this.model.findById(uid).populate("friends").exec();

    if (!user) return null;

    const { friends } = user;
    return friends as User[];
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
