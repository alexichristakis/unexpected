import {
  Controller,
  Get,
  Inject,
  PathParams,
  Put,
  UseAfter,
  UseAuth
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

  @Put("/:phoneNumber/:id")
  @MulterOptions({
    storage: multer.memoryStorage()
  })
  async uploadPost(
    @MultipartFile("image") file: Express.Multer.File,
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("id") id: string
  ): Promise<any> {
    const { buffer } = file;

    const path = this.imageService.getPostPath(phoneNumber, id);

    await this.imageService.upload(buffer, path);

    return true;
  }

  @Get("/:phoneNumber/:id")
  @UseAuth(AuthMiddleware)
  @UseAfter(SendImageMiddleware)
  async getPostImageUrl(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("id") id: string
  ) {
    const path = this.imageService.getPostPath(phoneNumber, id);

    const buffer = await this.imageService.download(path);

    return buffer;
  }

  @Put("/:phoneNumber")
  @MulterOptions({
    storage: multer.memoryStorage()
  })
  async uploadProfileImage(
    @MultipartFile("image") file: Express.Multer.File,
    @PathParams("phoneNumber") phoneNumber: string
  ): Promise<any> {
    const { buffer } = file;

    const path = this.imageService.getProfilePath(phoneNumber);

    await this.imageService.upload(buffer, path);

    return true;
  }

  @Get("/:phoneNumber")
  @UseAfter(SendImageMiddleware)
  async getUserProfileImage(@PathParams("phoneNumber") phoneNumber: string) {
    const path = this.imageService.getProfilePath(phoneNumber);

    const buffer = await this.imageService.download(path);

    return buffer;
  }
}
