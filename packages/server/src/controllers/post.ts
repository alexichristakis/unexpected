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

import { Comment, NewPost } from "@unexpected/global";

import { AuthMiddleware, Select } from "../middlewares/auth";
import { PostService } from "../services/post";

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(PostService)
  private postService: PostService;

  @Put("/:uid")
  @UseAuth(AuthMiddleware, { select: Select.phoneFromPath })
  sendPost(@PathParams("uid") uid: string, @BodyParams("post") post: NewPost) {
    // uid, post
    return this.postService.createNewPost(uid, post);
  }

  @Get("/:uid/posts")
  getUsersPosts(@PathParams("uid") uid: string) {
    return this.postService.getUsersPosts(uid);
  }

  @Get("/:uid/feed")
  async getUsersFeed(@PathParams("uid") uid: string) {
    return this.postService.getFeedForUser(uid);
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
