import { Controller, BodyParams, Get, Put, PathParams, UseAuth, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { UserType, User as UserModel } from "../models/user";
import { AuthMiddleware } from "../middlewares/auth";

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(UserModel)
  private User: MongooseModel<UserModel>;

  @Get()
  findAll(): string {
    return "This action returns all calendars";
  }

  @Put()
  async createPost(@BodyParams("user") user: UserType): Promise<UserModel> {
    console.log(user);

    const doc = new this.User(user);

    return doc.save();
  }
}
