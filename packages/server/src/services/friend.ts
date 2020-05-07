import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { FriendRequest } from "@unexpected/global";

import { FriendRequestModel } from "@global";
import { CRUDService } from "./crud";
import { SlackLogService } from "./logger";
import { NotificationService } from "./notification";
import { UserService } from "./user";

@Service()
export class FriendService extends CRUDService<
  FriendRequestModel,
  FriendRequest
> {
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

  async getFriendRequests(to: string) {
    return this.find({ to });
  }

  async getRequestedFriends(from: string) {
    return this.find({ from });
  }

  async sendFriendRequest(from: string, to: string) {
    const [fromUser, toUser] = await this.userService.getByPhoneNumber(
      [from, to],
      true
    );

    const [request] = await Promise.all([
      // @ts-ignore
      this.create({ from, to }),
      this.notificationService.notifyWithNavigationToUser(
        toUser,
        `${fromUser.firstName} sent you a friend request!`,
        fromUser
      ),
    ]);

    return request;
  }

  async deleteFriendRequest(from: string, to: string) {
    const doc = await this.findOne({ from, to });

    if (doc) {
      return doc.remove();
    }

    return null;
  }

  async acceptFriendRequest(from: string, to: string) {
    const doc = await this.findOne({ from, to });

    if (doc) {
      return Promise.all([doc.remove(), this.userService.friend(from, to)]);
    }

    return null;
  }
}
