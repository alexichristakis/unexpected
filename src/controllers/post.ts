import {
  Controller,
  BodyParams,
  Get,
  Put,
  PathParams,
  UseAuth,
  Inject
} from "@tsed/common";

import { PostService } from "../services/post";
import { AuthMiddleware, Select } from "../middlewares/auth";
import { PostType, FeedPostType } from "../models/post";

export type FeedReturnType = FeedPostType[];

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(PostService)
  private postService: PostService;

  @Put("/:phoneNumber")
  @UseAuth(AuthMiddleware, { select: Select.phoneFromPath })
  sendPost(
    @PathParams("phoneNumber") phoneNumber: string,
    @BodyParams("post") post: PostType
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
  async getUsersFeed(
    @PathParams("phoneNumber") phoneNumber: string
  ): Promise<FeedReturnType> {
    const feed = await this.postService.getFeedForUser(phoneNumber);

    return feed;
  }
}
