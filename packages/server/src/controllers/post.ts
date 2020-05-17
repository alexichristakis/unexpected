import {
  BodyParams,
  Context,
  Controller,
  Delete,
  Get,
  Inject,
  PathParams,
  Put,
  UseAuth,
} from "@tsed/common";
import { MulterOptions, MultipartFile } from "@tsed/multipartfiles";
import { Forbidden } from "ts-httpexceptions";
import multer from "multer";

import { AuthMiddleware } from "../middlewares/auth";
import { PostService, ImageService, UserService } from "../services";

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

  @Get()
  async getPosts(@Context("auth") auth: string) {
    return this.postService.getUsersPosts(auth);
  }

  @Get("/feed")
  async getFeed(@Context("auth") userId: string) {
    return this.postService.getFeedForUser(userId);
  }

  @Get("/user/:userId")
  async getUsersPosts(
    @PathParams("userId") userId: string,
    @Context("auth") auth: string
  ) {
    const user = await this.userService.get(userId, "friends");

    if (!user) return null;

    // assert users are friends before fetching posts
    if (!user.friends.includes(auth)) {
      throw new Forbidden("Forbidden");
    }

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
