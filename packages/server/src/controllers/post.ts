import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  PathParams,
  Put,
  UseAuth,
  Context,
} from "@tsed/common";

import { MulterOptions, MultipartFile } from "@tsed/multipartfiles";
import multer from "multer";
import { ImageService } from "src/services/images";
import { UserService } from "src/services/user";
import { AuthMiddleware } from "../middlewares/auth";
import { PostService } from "../services/post";
import { Forbidden } from "ts-httpexceptions";

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(PostService)
  private postService: PostService;

  @Inject(ImageService)
  private imageService: ImageService;

  @Inject(UserService)
  private userService: UserService;

  @Put()
  @MulterOptions({ storage: multer.memoryStorage() })
  async sendPost(
    @MultipartFile("image") file: Express.Multer.File,
    @BodyParams("description") description: string,
    @Context("auth") userId: string
  ) {
    const post = await this.postService.create({ description, user: userId });

    const imagePath = this.imageService.getPostPath(userId, post.id);

    const { buffer } = file;
    await Promise.all([
      this.userService.updateValidNotifications(userId),
      this.imageService.upload(buffer, imagePath),
    ]);

    return true;
  }

  @Get("/feed")
  async getUsersFeed(@Context("auth") userId: string) {
    return this.postService.getFeedForUser(userId);
  }

  @Get("/:userId/posts")
  getUsersPosts(@PathParams("userId") userId: string) {
    return this.postService.getUsersPosts(userId);
  }

  @Get("/:id")
  async getPost(@PathParams("id") id: string) {
    return this.postService.getPostWithComments(id);
  }

  @Delete("/:id")
  async deletePost(@PathParams("id") id: string) {
    const post = await this.postService.getPost(id);

    if (!post) {
      return null;
    }

    if (post.user !== id) {
      throw new Forbidden("Forbidden");
    }

    return post.remove();
  }
}
