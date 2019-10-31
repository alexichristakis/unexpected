import { Controller, Inject, Put, Status } from "@tsed/common";
import { MulterOptions, MultipartFile } from "@tsed/multipartfiles";
import multer from "multer";

import { ImageService } from "../services/images";

@Controller("/upload")
export class UploadController {
  @Inject(ImageService)
  private imageService: ImageService;

  @Put("/image")
  @MulterOptions({
    dest: `${process.cwd()}/.tmp`,
    storage: multer.diskStorage({
      filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
      }
    })
  })
  async add(@MultipartFile("image") file: Express.Multer.File): Promise<any> {
    console.log("file: ", file);

    await this.imageService.upload(file);

    return true;
  }
}
