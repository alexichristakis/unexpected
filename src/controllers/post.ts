import { Controller, BodyParams, Get, Put, PathParams, UseAuth, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { PostService } from "../services/post";
import { AuthMiddleware } from "../middlewares/auth";

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(PostService)
  private postService: PostService;
}
