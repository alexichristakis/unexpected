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
import { UserModel, UserType } from "../models/user";
import { AuthMiddleware, Select } from "../middlewares/auth";

@Controller("/user")
@UseAuth(AuthMiddleware)
export class UserController {
  @Inject(UserService)
  private userService: UserService;

  @Get()
  findAll(): string {
    return "This action returns all calendars";
  }

  // @Delete()
  // async deleteUser() {
  //   return this.userService.delete("5db875fc6db5000021871f3d");
  // }

  @Put()
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromUserFromBody
  })
  async createUser(@BodyParams("user") user: UserType): Promise<UserModel | void> {
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

  // @Put()
  // async followUser() {}

  // @Put()
  // async unFollowUser() {}
}
