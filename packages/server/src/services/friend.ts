import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import filter from "lodash/filter";

import { FriendRequest, FriendRequestModel, User } from "@global";
import { SlackLogService } from "./logger";
import { NotificationService } from "./notification";
import { UserService } from "./user";

@Service()
export class FriendService {
  // model
  @Inject(FriendRequestModel)
  model: MongooseModel<FriendRequestModel>;

  // services
  @Inject(UserService)
  private userService: UserService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  @Inject(SlackLogService)
  private logger: SlackLogService;

  async getRequests(id: string) {
    return this.model
      .find({ $or: [{ to: id }, { from: id }] })
      .populate("from to");
  }

  async getAll() {
    return this.model.find().exec();
  }

  async delete(id: string) {
    return this.model.deleteOne({ _id: id });
  }

  async sendFriendRequest(from: string, to: string) {
    console.log(from, to);

    // const users = await this.userService.getMultiple([from, to]);

    // const [fromUser] = filter(users, ({ id }) => id === from);
    // const [toUser] = filter(users, ({ id }) => id === to);

    const [request] = await Promise.all([
      this.model.create({ from, to }),
      // this.notificationService.notifyWithNavigationToUser(
      //   toUser,
      //   `${fromUser.firstName} sent you a friend request!`,
      //   fromUser
      // ),
    ]);

    return request;
  }

  async deleteFriendRequest(from: string, to: string) {
    const doc = await this.model.findOne({ from, to });

    if (doc) {
      return doc.remove();
    }

    return null;
  }

  async acceptFriendRequest(from: string, to: string) {
    const doc = await this.model
      .findOne({ from, to })
      .populate("from to")
      .exec();

    console.log(doc);

    if (doc) {
      const { from: fromUser, to: toUser } = doc;

      return Promise.all([
        doc.remove(),
        this.userService.friend(fromUser as User, toUser as User),
      ]);
    }

    return null;
  }
}
