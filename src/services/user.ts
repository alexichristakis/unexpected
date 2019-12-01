import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Document } from "mongoose";
import _ from "lodash";

import { CRUDService } from "./crud";
import { User as UserModel, UserType } from "../models/user";
import { NotificationService } from "./notification";

@Service()
export class UserService extends CRUDService<UserModel, UserType> {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  @Inject(NotificationService)
  notificationService: NotificationService;

  async createNewUser(newUser: UserType) {
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
        userFrom,
        `${userTo.firstName} ${userTo.lastName} accepted your friend request.`
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
