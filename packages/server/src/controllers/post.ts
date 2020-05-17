import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  PathParams,
  Put,
  UseAuth,
} from "@tsed/common";

import { MulterOptions, MultipartFile } from "@tsed/multipartfiles";
import multer from "multer";
import { ImageService } from "src/services/images";
import { UserService } from "src/services/user";
import { AuthMiddleware } from "../middlewares/auth";
import { PostService } from "../services/post";

@Controller("/post")
@UseAuth(AuthMiddleware)
export class PostController {
  @Inject(PostService)
  private postService: PostService;

  @Inject(ImageService)
  private imageService: ImageService;

  @Inject(UserService)
  private userService: UserService;

  @Get()
  getAll() {
    return this.postService.getAll();
  }

  @Get("/populate/user")
  getAllWithUser() {
    return this.postService.getAll(null, "user");
  }

  @Put("/:userId")
  @UseAuth(AuthMiddleware, { select: "userId" })
  @MulterOptions({
    storage: multer.memoryStorage(),
  })
  async sendPost(
    @MultipartFile("image") file: Express.Multer.File,
    @BodyParams("description") description: string,
    @PathParams("userId") userId: string
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
