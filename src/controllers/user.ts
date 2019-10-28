import { Controller, BodyParams, Get, Put, PathParams, UseAuth, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { UserService } from "../services/user";
import { UserType, UserModel } from "../models/user";
import { AuthMiddleware } from "../middlewares/auth";

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
  async createUser(@BodyParams("user") user: UserType): Promise<void> {
    return this.userService.createNewUser(user);
  }

  @Put()
  async followUser() {}

  @Put()
  async unFollowUser() {}
}
