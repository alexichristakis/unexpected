import { Service } from "@tsed/common";
import { Storage } from "@google-cloud/storage";
import jimp from "jimp";

@Service()
export class ImageService {
  private storage = new Storage({
    projectId: "expect-photos",
    keyFilename: "certifications/google_cloud.json"
  });
  private bucket = this.storage.bucket(<string>process.env.GOOGLE_BUCKET_NAME);

  async resize(input: Express.Multer.File) {
    const image = await jimp.read(input.path);
  }

  async upload(image: Express.Multer.File) {
    const file = await this.bucket.upload(image.path);
  }
}
