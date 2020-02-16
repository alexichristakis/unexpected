import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  UseAuth
} from "@tsed/common";

import { Comment, Post } from "@unexpected/global";

import { AuthMiddleware, Select } from "../middlewares/auth";
import { PostService } from "../services/post";

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(PostService)
  private postService: PostService;

  @Put("/:phoneNumber")
  @UseAuth(AuthMiddleware, { select: Select.phoneFromPath })
  sendPost(
    @PathParams("phoneNumber") phoneNumber: string,
    @BodyParams("post") post: Post
  ) {
    return this.postService.createNewPost({
      ...post,
      phoneNumber
    });
  }

  @Get("/:phoneNumber/posts")
  getUsersPosts(@PathParams("phoneNumber") phoneNumber: string) {
    return this.postService.getUsersPosts(phoneNumber);
  }

  @Get("/:phoneNumber/feed")
  async getUsersFeed(@PathParams("phoneNumber") phoneNumber: string) {
    return this.postService.getFeedForUser(phoneNumber);
  }

  @Get("/:id")
  async getPostId(@PathParams("id") id: string) {
    return this.postService.getPost(id);
  }

  @Delete("/:id")
  async deletePost(@PathParams("id") id: string) {
    return this.postService.delete(id);
  }
}
