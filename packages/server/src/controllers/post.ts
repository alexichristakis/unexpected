import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  PathParams,
  Put,
  UseAuth
} from "@tsed/common";

import { Post } from "@unexpected/global";

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
      userPhoneNumber: phoneNumber
    });
  }

  @Get("/:phoneNumber")
  getUsersPosts(@PathParams("phoneNumber") phoneNumber: string) {
    return this.postService.getUsersPosts(phoneNumber);
  }

  @Get("/:phoneNumber/feed")
  async getUsersFeed(@PathParams("phoneNumber") phoneNumber: string) {
    const feed = await this.postService.getFeedForUser(phoneNumber);

    return feed;
  }

  @Delete("/:id")
  async deletePost(@PathParams("id") id: string) {
    return this.postService.delete(id);
  }
}
