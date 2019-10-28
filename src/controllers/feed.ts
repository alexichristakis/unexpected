import { Controller, BodyParams, Get, Put, PathParams, UseAuth, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { UserType, UserModel } from "../models/user";
import { AuthMiddleware } from "../middlewares/auth";

@Controller("/feed")
@UseAuth(AuthMiddleware)
export class FeedController {
  @Inject(UserModel)
  private User: MongooseModel<UserModel>;

  @Get()
  findAll(): string {
    return "This action returns all calendars";
  }
}
