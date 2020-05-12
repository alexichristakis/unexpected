import {
  Controller,
  Get,
  Inject,
  PathParams,
  Put,
  UseAfter,
  UseAuth,
} from "@tsed/common";
import { MulterOptions, MultipartFile } from "@tsed/multipartfiles";
import multer from "multer";

import { AuthMiddleware } from "../middlewares/auth";
import { SendImageMiddleware } from "../middlewares/send-image";
import { ImageService } from "../services/images";

@Controller("/image")
export class ImageController {
  @Inject(ImageService)
  private imageService: ImageService;

  @Get("/:userId/:photoId")
  @UseAuth(AuthMiddleware)
  @UseAfter(SendImageMiddleware)
  downloadPostImage(
    @PathParams("userId") userId: string,
    @PathParams("photoId") photoId: string
  ) {
    const path = this.imageService.getPostPath(userId, photoId);

    return this.imageService.download(path);
  }

  @Get("/:userId")
  @UseAfter(SendImageMiddleware)
  downloadProfileImage(@PathParams("userId") userId: string) {
    const path = this.imageService.getProfilePath(userId);

    return this.imageService.download(path);
  }

  @Put("/:userId")
  @MulterOptions({ storage: multer.memoryStorage() })
  async uploadProfileImage(
    @MultipartFile("image") file: Express.Multer.File,
    @PathParams("userId") userId: string
  ) {
    const { buffer } = file;

    const path = this.imageService.getProfilePath(userId);

    return this.imageService.upload(buffer, path);
  }
}
