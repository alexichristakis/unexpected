import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import filter from "lodash/filter";

import {
  DefaultUserSelect,
  FriendRequest,
  FriendRequestModel,
  FriendRequest_populated,
  FriendRequest_populated_id,
  PartialUser,
  User,
  UserModel,
  _idToId,
} from "@global";
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
    const requests = (await this.model
      .find({ $or: [{ to: id }, { from: id }] })
      .populate("from to", DefaultUserSelect)
      .lean()
      .exec()) as FriendRequest_populated[];

    return requests.map(({ from, to, ...rest }) => ({
      from: _idToId(from),
      to: _idToId(to),
      ..._idToId(rest),
    }));
  }

  async getAll() {
    return this.model.find().exec();
  }

  async delete(id: string) {
    return this.model.deleteOne({ _id: id });
  }

  async getRequest(a: string, b: string) {
    const request = await this.model
      .findOne({
        $or: [
          { to: a, from: b },
          { to: b, from: a },
        ],
      })
      .populate("from to")
      .lean()
      .exec();

    if (!request) return request;

    const { to, from, ...rest } = _idToId(request);

    return {
      to: _idToId(to as User),
      from: _idToId(from as User),
      ...rest,
    } as FriendRequest_populated;
  }

  async sendFriendRequest(from: string, to: string) {
    const request = await (await this.model.create({ from, to }))
      .populate("from to")
      .execPopulate();

    const fromUser = request.from as User;
    const toUser = request.to as User;

    await this.notificationService.notifyWithNavigationToUser(
      toUser,
      `${fromUser.firstName} sent you a friend request!`,
      fromUser
    );

    return request;
  }

  async acceptFriendRequest(request: FriendRequest_populated_id) {
    const { id, from, to } = request;

    return Promise.all([
      // delete request
      this.model.deleteOne({ _id: id }),

      // update user records
      this.userService.friend(from, to),
    ]);
  }
}
