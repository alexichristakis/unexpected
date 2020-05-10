import { $log, Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Post, User, UserNotificationRecord } from "@unexpected/global";
import _ from "lodash";
import moment from "moment";
import { Document } from "mongoose";

import { UserModel } from "@global";
import { NOTIFICATION_MINUTES } from "../lib/constants";
import { CRUDService } from "./crud";
import { SlackLogService } from "./logger";
import { NotificationService } from "./notification";

@Service()
export class UserService extends CRUDService<UserModel, User> {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  @Inject(SlackLogService)
  logger: SlackLogService;

  @Inject(NotificationService)
  notificationService: NotificationService;

  async get(uid: string) {
    return this.model.findById(uid).exec();
  }

  async createNewUser(newUser: User) {
    const user = await this.getByPhoneNumber(newUser.phoneNumber);

    if (user) return user;

    const [createdUser] = await Promise.all([
      this.create(newUser),
      this.logger.sendMessage(
        "new user",
        `${newUser.firstName} ${newUser.lastName}`
      ),
    ]);

    return createdUser;
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

  async updateValidNotifications(post: Post) {
    const { createdAt, phoneNumber } = post;

    const time = moment(createdAt);
    const user = await this.findOne({ phoneNumber }, ["notifications"]);

    if (!user) return;

    const { notifications } = user;
    const updatedNotifications = notifications.filter(
      (notification) =>
        !time.isBetween(
          notification,
          moment(notification).add(NOTIFICATION_MINUTES, "minutes")
        )
    );

    return this.updateOne(
      { phoneNumber },
      { notifications: updatedNotifications }
    );
  }

  async cameraEnabled(phoneNumber: string) {
    const user = await this.findOne({ phoneNumber }, ["notifications"]);

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
      times.map(({ phoneNumber, notifications }) => ({
        updateOne: {
          filter: { phoneNumber },
          update: { $set: { notifications } },
        },
      }))
    );

    $log.info(res);
  }

  async unfriend(from: string, to: string) {
    const [userFrom, userTo] = await this.getByPhoneNumber([from, to], true);

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

  async friend(from: string, to: string) {
    const [userFrom, userTo] = await this.getByPhoneNumber([from, to], true);

    const res = await Promise.all([
      this.model
        .updateOne(
          { phoneNumber: from },
          {
            friends: _.uniq([...userFrom.friends, to]),
          }
        )
        .exec(),
      this.model
        .updateOne(
          { phoneNumber: to },
          {
            friends: _.uniq([...userTo.friends, from]),
          }
        )
        .exec(),
      this.notificationService.notifyWithNavigationToUser(
        userTo,
        `${userFrom.firstName} ${userFrom.lastName} accepted your friend request.`,
        userFrom
      ),
    ]);
  }

  async getUserFriends(uid: string) {
    const user = await this.model.findById(uid).populate("friends").exec();

    if (!user) return null;

    const { friends } = user;
    return friends;
  }

  async getByPhoneNumber(phoneNumber?: string): Promise<UserModel & Document>;
  async getByPhoneNumber(
    phoneNumbers: string[],
    sort?: boolean,
    select?: string
  ): Promise<(UserModel & Document)[]>;
  async getByPhoneNumber(
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

    return this.findOne({ phoneNumber });
  }
}
