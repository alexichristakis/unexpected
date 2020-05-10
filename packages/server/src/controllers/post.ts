import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  UseAuth,
} from "@tsed/common";

import { Comment, Post } from "@global";

import { AuthMiddleware, Select } from "../middlewares/auth";
import { PostService } from "../services/post";

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(PostService)
  private postService: PostService;

  @Get()
  getAll() {
    return this.postService.getAll();
  }

  @Get("/migrate")
  updateAll() {
    return this.postService.updateAll();
  }

  @Get("/populate/user")
  getAllWithUser() {
    return this.postService.getAll(null, "user");
  }

  @Put("/:userId")
  @UseAuth(AuthMiddleware, { select: "userId" })
  sendPost(
    @PathParams("userId") userId: string,
    @BodyParams("post") post: Post
  ) {
    return this.postService.createNewPost({
      ...post,
      user: userId,
    });
  }

  @Get("/:userId/posts")
  getUsersPosts(@PathParams("userId") userId: string) {
    return this.postService.getUsersPosts(userId);
  }

  @Get("/:userId/feed")
  async getUsersFeed(@PathParams("userId") userId: string) {
    return this.postService.getFeedForUser(userId);
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
