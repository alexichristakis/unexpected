import { $log, Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Document } from "mongoose";
import _ from "lodash";
import moment from "moment";
import { User, Post, UserNotificationRecord } from "@unexpected/global";

import { NOTIFICATION_MINUTES } from "../lib/constants";
import { CRUDService } from "./crud";
import { User as UserModel } from "../models/user";
import { NotificationService } from "./notification";

@Service()
export class UserService extends CRUDService<UserModel, User> {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  @Inject(NotificationService)
  notificationService: NotificationService;

  async createNewUser(newUser: User) {
    const user = await this.getByPhoneNumber(newUser.phoneNumber);

    if (user) return user;

    return this.create(newUser);
  }

  async search(query: string) {
    if (query.match(/^[2-9]\d{2}\d{3}\d{4}$/)) {
      return this.model.find({ phoneNumber: new RegExp(query) }).exec();
    } else {
      const [firstName, lastName] = query.split(" ");

      return this.model
        .find({
          firstName: new RegExp(firstName, "i"),
          lastName: new RegExp(lastName, "i")
        })
        .exec();
    }
  }

  async updateValidNotifications(post: Post) {
    const { createdAt, userPhoneNumber } = post;

    const time = moment(createdAt);
    const user = await this.findOne({ phoneNumber: userPhoneNumber }, [
      "notifications"
    ]);

    if (!user) return;

    const { notifications } = user;
    const updatedNotifications = notifications.filter(
      notification =>
        !time.isBetween(
          notification,
          moment(notification).add(NOTIFICATION_MINUTES, "minutes")
        )
    );

    return this.updateOne(
      { phoneNumber: userPhoneNumber },
      { notifications: updatedNotifications }
    );
  }

  async cameraEnabled(phoneNumber: string) {
    const user = await this.findOne({ phoneNumber }, ["notifications"]);

    if (!user) return { enabled: false };

    const { notifications } = user;

    const currentTime = moment();

    // check to see if the current time is between what's given
    for (let i = 0; i < notifications.length; i++) {
      const start = moment(notifications[i]);
      const end = start.clone().add(NOTIFICATION_MINUTES, "minutes");

      if (currentTime.isBetween(start, end, undefined, "[]")) {
        return { enabled: true, start: start.toISOString() };
      }
    }

    return { enabled: false };
  }

  async setNotificationTimes(times: UserNotificationRecord[]) {
    const res = await this.model.bulkWrite(
      times.map(({ phoneNumber, notifications }) => ({
        updateOne: {
          filter: { phoneNumber },
          update: { $set: { notifications } }
        }
      }))
    );

    $log.info(res);
  }

  async friend(from: string, to: string) {
    const [userFrom, userTo] = await this.getByPhoneNumber([from, to], true);

    await Promise.all([
      this.model
        .updateOne(
          { phoneNumber: to },
          { friendRequests: _.uniq([...userTo.friendRequests, from]) }
        )
        .exec(),
      this.model
        .updateOne(
          { phoneNumber: from },
          { requestedFriends: _.uniq([...userFrom.requestedFriends, to]) }
        )
        .exec(),
      this.notificationService.notifyUserModel(
        userTo,
        `${userFrom.firstName} ${userFrom.lastName} sent you a friend request.`
      )
    ]);
  }

  async unfriend(from: string, to: string) {
    const [userFrom, userTo] = await this.getByPhoneNumber([from, to], true);

    await Promise.all([
      this.model
        .updateOne(
          { phoneNumber: to },
          {
            friends: _.remove(userTo.friends, from)
          }
        )
        .exec(),
      this.model
        .updateOne(
          { phoneNumber: from },
          {
            friends: _.remove(userFrom.friends, to)
          }
        )
        .exec()
    ]);
  }

  async acceptFriendRequest(from: string, to: string) {
    const [userFrom, userTo] = await this.getByPhoneNumber([from, to], true);

    await Promise.all([
      this.model
        .updateOne(
          { phoneNumber: from },
          {
            friendRequests: _.remove(userFrom.friendRequests, to),
            friends: _.uniq([...userFrom.friends, to])
          }
        )
        .exec(),
      this.model
        .updateOne(
          { phoneNumber: to },
          {
            requestedFriends: _.remove(userTo.requestedFriends, from),
            friends: _.uniq([...userTo.friends, from])
          }
        )
        .exec(),
      this.notificationService.notifyUserModel(
        userTo,
        `${userFrom.firstName} ${userFrom.lastName} accepted your friend request.`
      )
    ]);
  }

  async denyFriendRequest(from: string, to: string) {
    const [userFrom, userTo] = await this.getByPhoneNumber([from, to], true);

    await Promise.all([
      this.model
        .updateOne(
          { phoneNumber: to },
          { friendRequests: _.remove(userTo.friendRequests, from) }
        )
        .exec(),
      this.model
        .updateOne(
          { phoneNumber: from },
          { requestedFriends: _.remove(userFrom.requestedFriends, to) }
        )
        .exec()
    ]);
  }

  async getUserFriends(phoneNumber: string) {
    const user = await this.getByPhoneNumber(phoneNumber);
    const { friends } = user;

    return this.getByPhoneNumber(friends);
  }

  async getByPhoneNumber(phoneNumber: string): Promise<UserModel & Document>;
  async getByPhoneNumber(
    phoneNumbers: string[],
    sort?: boolean,
    select?: string
  ): Promise<(UserModel & Document)[]>;
  async getByPhoneNumber(
    phoneNumber: string | string[],
    sort?: boolean,
    select?: string
  ) {
    if (phoneNumber instanceof Array) {
      const users = await this.model
        .find({
          phoneNumber: { $in: phoneNumber }
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
