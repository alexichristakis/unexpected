import {
  Controller,
  BodyParams,
  Get,
  Put,
  Delete,
  PathParams,
  UseAuth,
  Inject,
  Patch
} from "@tsed/common";

import { UserService } from "../services/user";
import { User as UserModel, UserType } from "../models/user";
import { AuthMiddleware, Select } from "../middlewares/auth";

@Controller("/user")
@UseAuth(AuthMiddleware)
export class UserController {
  @Inject(UserService)
  private userService: UserService;

  @Get("/search/:query")
  @UseAuth(AuthMiddleware)
  async search(@PathParams("query") query: string) {
    return this.userService.search(query);
  }

  @Get("/:phoneNumber")
  @UseAuth(AuthMiddleware)
  async getUser(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.getByPhoneNumber(phoneNumber);
  }

  @Get("/:phoneNumber/following")
  @UseAuth(AuthMiddleware)
  async getUserFollowing(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.getUserFriends(phoneNumber);
  }

  @Put()
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromUserFromBody
  })
  async createUser(
    @BodyParams("user") user: UserType
  ): Promise<UserModel | void> {
    return this.userService.createNewUser(user);
  }

  @Patch("/:phoneNumber")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async updateUser(
    @PathParams("phoneNumber") phoneNumber: string,
    @BodyParams("user") user: Partial<UserType>
  ): Promise<void> {
    return this.userService.updateOne({ phoneNumber }, user);
  }

  @Patch("/:phoneNumber/friend/:to")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async friendUser(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("to") to: string
  ) {
    return this.userService.friend(phoneNumber, to);
  }

  @Patch("/:phoneNumber/accept/:to")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async acceptFriendRequest(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("to") to: string
  ) {
    return this.userService.acceptFriendRequest(phoneNumber, to);
  }

  @Patch("/:phoneNumber/deny/:to")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async denyFriendRequest(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("to") to: string
  ) {
    return this.userService.denyFriendRequest(phoneNumber, to);
  }

  // @Put()
  // async unFollowUser() {}
}
