import { Service } from "@tsed/common";
import { Storage } from "@google-cloud/storage";
import jimp from "jimp";

@Service()
export class ImageService {
  private storage = new Storage();
  private bucket = this.storage.bucket(process.env.GOOGLE_BUCKET_NAME || "");

  async upload(image: Express.Multer.File) {
    await this.bucket.upload(image.path);
  }
}
