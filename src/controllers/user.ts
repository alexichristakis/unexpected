import { Controller, BodyParams, Get, Put, PathParams, UseAuth, Inject, Patch } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { UserService } from "../services/user";
import { UserModel, UserType } from "../models/user";
import { AuthMiddleware, Verify, Select } from "../middlewares/auth";

@Controller("/user")
@UseAuth(AuthMiddleware)
export class UserController {
  @Inject(UserService)
  private userService: UserService;

  @Get()
  findAll(): string {
    return "This action returns all calendars";
  }

  @Put()
  @UseAuth(AuthMiddleware, {
    select: Select.userFromBody,
    verify: Verify.userPhoneNumberMatchesToken
  })
  async createUser(@BodyParams("user") user: UserType): Promise<UserModel> {
    console.log(user);
    return this.userService.createNewUser(user);
  }

  @Patch("/:phoneNumber")
  @UseAuth(AuthMiddleware, {
    select: Select.userFromBody,
    verify: Verify.userPhoneNumberMatchesToken
  })
  async updateUser(
    @PathParams("phoneNumber") phoneNumber: string,
    @BodyParams("user") user: Partial<UserType>
  ): Promise<void> {
    console.log(phoneNumber, user);
    return this.userService.updateOne({ phoneNumber }, user);
  }

  // @Put()
  // async followUser() {}

  // @Put()
  // async unFollowUser() {}
}
