import { Controller, BodyParams, Get, Put, PathParams, UseAuth, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

// import { UserType, UserModel } from "../models/user";
import { AuthMiddleware } from "../middlewares/auth";
import { PostService } from "../services/post";

@Controller("/feed")
@UseAuth(AuthMiddleware)
export class FeedController {
  @Inject(PostService)
  private postService: PostService;

  @Get("/:phoneNumber")
  async getFeed(@PathParams("phoneNumber") phoneNumber: string) {
    const feed = await this.postService.getFeedForUser(phoneNumber);

    return feed;
  }

  // @Inject(UserModel)
  // private User: MongooseModel<UserModel>;
  // @Get()
  // findAll(): string {
  //   return "This action returns all calendars";
  // }
}
