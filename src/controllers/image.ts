import { Controller, Inject, Put, Get, PathParams, UseAfter, UseAuth } from "@tsed/common";
import { MulterOptions, MultipartFile } from "@tsed/multipartfiles";
import multer from "multer";

import { SendFileMiddleware } from "../middlewares/send-file";
import { ImageService } from "../services/images";
import { AuthMiddleware } from "../middlewares/auth";

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

  @Put("/:phoneNumber/profile")
  @MulterOptions({
    storage: multer.memoryStorage()
  })
  async uploadProfileImage(
    @MultipartFile("image") file: Express.Multer.File,
    @PathParams("phoneNumber") phoneNumber: string
  ): Promise<any> {
    const { buffer } = file;

    const path = this.imageService.getProfilePath(phoneNumber);

    await this.imageService.upload(buffer, path, true);

    return true;
  }

  @Get("/:phoneNumber/profile")
  async getUserProfilePhoto(@PathParams("phoneNumber") phoneNumber: string) {
    return this.imageService.downloadUserPhoto(phoneNumber);
  }

  @Get("/:phoneNumber/:id")
  @UseAuth(AuthMiddleware)
  @UseAfter(SendFileMiddleware)
  async getPostImageUrl(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("id") id: string
  ) {
    const buffer = await this.imageService.downloadPostImage(phoneNumber, id);

    return buffer;
  }

  @Get("/:phoneNumber/all")
  async getUsersPhotos(@PathParams("phoneNumber") phoneNumber: string) {
    return this.imageService.downloadAllPhotoUrls(phoneNumber);
  }
}
