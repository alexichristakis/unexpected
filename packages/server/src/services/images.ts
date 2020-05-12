import {
  GetFilesOptions,
  GetSignedUrlConfig,
  Storage,
} from "@google-cloud/storage";
import { Service } from "@tsed/common";
import jimp from "jimp";
import { Duplex } from "stream";

/*
  bucket structure:

  folder for each user by phonenumber
  - profile picture: BUCKET/${phonenumber}/profile.jpg
  - post: BUCKET/${phonenumber}/posts/${post_id}.jpg

*/

@Service()
export class ImageService {
  private storage = new Storage({
    projectId: "expect-photos",
    keyFilename: "google_cloud.json",
  });

  private bucket = this.storage.bucket(
    process.env.GOOGLE_BUCKET_NAME as string
  );

  async resize(input: Buffer, width: number, height: number) {
    const image = await jimp.read(input);

    const resizedImage = image.resize(width, height);

    return resizedImage;
  }

  getProfilePath(userId: string) {
    return `${userId}/profile.jpg`;
  }

  getPostPath(userId: string, id: string) {
    return `${userId}/posts/${id}.jpg`;
  }

  async upload(image: Buffer, path: string) {
    const readStream = new Duplex();
    readStream.push(image);
    readStream.push(null);

    const writeStream = this.bucket
      .file(path)
      .createWriteStream({ metadata: { contentType: "image/jpeg" } });

    const res = await new Promise((resolve, reject) => {
      readStream
        .pipe(writeStream)
        .once("error", (err) => {
          return reject({ err });
        })
        .once("finish", () => {
          return resolve();
        });
    });
  }

  async getUrl(filename: string) {
    const options: GetSignedUrlConfig = {
      version: "v4",
      action: "read",
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    };

    // Get a v4 signed URL for reading the file
    const [url] = await this.bucket.file(filename).getSignedUrl(options);

    return url;
  }

  async download(path: string) {
    const [file] = await this.bucket.file(path).get();
    const [buffer] = await file.download();

    return buffer;
  }

  async downloadAllPhotoUrls(phoneNumber: string) {
    const fileOptions: GetFilesOptions = {
      directory: `${phoneNumber}/posts`,
    };

    const [files, {}, metadata] = await this.bucket.getFiles(fileOptions);

    const downloadOptions: GetSignedUrlConfig = {
      version: "v4",
      action: "read",
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    };

    const urls = await Promise.all(
      files.map((file) => file.getSignedUrl(downloadOptions))
    );

    return urls;
  }
}
