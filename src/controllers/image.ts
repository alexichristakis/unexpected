import { Controller, Inject, Put, Status, Get, PathParams } from "@tsed/common";
import { MulterOptions, MultipartFile } from "@tsed/multipartfiles";
import multer from "multer";

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

    await this.imageService.upload(buffer, path);

    return true;
  }

  @Get("/:phoneNumber/profile")
  async getUserProfilePhoto(@PathParams("phoneNumber") phoneNumber: string) {
    return this.imageService.downloadUserPhoto(phoneNumber);
  }

  @Get("/:phoneNumber/:id")
  async getPostImageUrl(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("id") id: string
  ) {
    return this.imageService.downloadPostImage(phoneNumber, id);
  }

  @Get("/:phoneNumber/all")
  async getUsersPhotos(@PathParams("phoneNumber") phoneNumber: string) {
    return this.imageService.downloadAllPhotoUrls(phoneNumber);
  }
}
