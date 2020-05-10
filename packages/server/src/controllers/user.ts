import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  QueryParams,
  UseAuth,
} from "@tsed/common";

import { User, UserModel, NewUser } from "@global";
import { AuthMiddleware, Select } from "../middlewares/auth";
import { FriendService } from "../services/friend";
import { UserService } from "../services/user";

export type CameraEnabledReturn = ReturnType<
  UserController["getIsCameraEnabled"]
>;

@Controller("/user")
@UseAuth(AuthMiddleware)
export class UserController {
  @Inject(UserService)
  private userService: UserService;

  @Inject(FriendService)
  private friendService: FriendService;

  @Get("/search/:query")
  async search(@PathParams("query") query: string) {
    return this.userService.search(query);
  }

  @Get("/:id/camera")
  async getIsCameraEnabled(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.cameraEnabled(phoneNumber);
  }

  @Get()
  async getUsers(
    @QueryParams("ids") ids: string,
    @QueryParams("select") select?: string
  ) {
    const uids = ids.includes(",") ? ids.split(",") : [ids];

    const selectOn = select?.split(",").join(" ") || "firstName lastName";

    return this.userService.getMultiple(uids, selectOn);
  }

  @Get("/:id")
  async getUser(
    @PathParams("id") id: string,
    @QueryParams("select") select?: string,
    @QueryParams("populate") populate?: string
  ) {
    return this.userService.get(id, select, populate);
  }

  @Get("/phone/:phoneNumber")
  async getUserByPhone(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.getByPhone(phoneNumber);
  }

  @Get("/:id/friends")
  async getUserFriends(@PathParams("id") id: string) {
    return this.userService.getFriends(id);
  }

  @Put()
  // @UseAuth(AuthMiddleware, {
  //   // select: Select.phoneFromUserFromBody,
  // })
  async createUser(@BodyParams("user") user: NewUser) {
    return this.userService.create(user);
  }

  @Patch("/:id")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath,
  })
  async updateUser(
    @PathParams("id") id: string,
    @BodyParams("user") user: Partial<User>
  ) {
    return this.userService.update(id, user);
  }

  @Get("/:id/requests")
  async getRequests(@PathParams("id") id: string) {
    const requests = await this.friendService.getRequests(id);

    const friendRequests = requests.filter(({ to }) => to.toString() === id);
    const requestedFriends = requests.filter(
      ({ from }) => from.toString() === id
    );

    return { friendRequests, requestedFriends };
  }

  @Patch("/:from/friend/:to")
  // @UseAuth(AuthMiddleware, {
  //   select: Select.phoneFromPath,
  // })
  async friendUser(
    @PathParams("from") from: string,
    @PathParams("to") to: string
  ) {
    if (from !== to) {
      return this.friendService.sendFriendRequest(from, to);
    }

    return null;
  }

  @Delete("/request/:id")
  async deleteRequest(@PathParams("id") id: string) {
    return this.friendService.delete(id);
  }

  @Patch("/:to/accept/:from")
  // @UseAuth(AuthMiddleware, {
  //   select: Select.phoneFromPath,
  // })
  async acceptFriendRequest(
    @PathParams("to") to: string,
    @PathParams("from") from: string
  ) {
    if (to !== from) {
      return this.friendService.acceptFriendRequest(from, to);
    }

    return null;
  }

  @Patch("/:phoneNumber/delete/:to")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath,
  })
  async deleteFriend(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("to") to: string
  ) {
    if (phoneNumber !== to) {
      return this.userService.unfriend(phoneNumber, to);
    }

    return null;
  }
}
