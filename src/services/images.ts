import { Service } from "@tsed/common";
import { Storage, GetSignedUrlConfig, GetFilesOptions } from "@google-cloud/storage";
import jimp from "jimp";
import { Stream, Duplex } from "stream";

/*
  bucket structure:

  folder for each user by phonenumber
  - profile picture: BUCKET/${phonenumber}/PROFILE_IMAGE.jpg
  - post: BUCKET/${phonenumber}/posts/${post_id}.jpg

*/

@Service()
export class ImageService {
  private storage = new Storage({
    projectId: "expect-photos",
    keyFilename: "certifications/google_cloud.json"
  });
  private bucket = this.storage.bucket(<string>process.env.GOOGLE_BUCKET_NAME);

  async resize(input: Buffer, width: number, height: number) {
    // const image = await jimp.read(input.path);
    const image = await jimp.read(input);

    const resizedImage = image.resize(width, height);

    return resizedImage;
  }

  getProfilePath(phoneNumber: string) {
    return `${phoneNumber}/PROFILE_IMAGE.jpg`;
  }

  getPostPath(phoneNumber: string, id: string) {
    return `${phoneNumber}/posts/${id}.jpg`;
  }

  async upload(image: Buffer, path: string, makePublic?: boolean) {
    const readStream = new Duplex();
    readStream.push(image);
    readStream.push(null);

    const writeStream = this.bucket
      .file(path)
      .createWriteStream({ metadata: { contentType: "image/jpeg" } });

    const { err }: { err?: Error } = await new Promise((resolve, reject) => {
      readStream
        .pipe(writeStream)
        .on("error", err => {
          return reject({ err });
        })
        .on("finish", () => {
          return resolve();
        });
    });

    if (makePublic) {
      await this.bucket.file(path).makePublic();
    }
  }

  async getUrl(filename: string) {
    const options: GetSignedUrlConfig = {
      version: "v4",
      action: "read",
      expires: Date.now() + 30 * 60 * 1000 // 30 minutes
    };

    // Get a v4 signed URL for reading the file
    const [url] = await this.bucket.file(filename).getSignedUrl(options);

    return url;
  }

  async downloadPostImage(phoneNumber: string, id: string) {
    // return this.getUrl(`${phoneNumber}/posts/${id}.jpg`);
    const [file] = await this.bucket.file(`${phoneNumber}/posts/${id}.jpg`).get();
    const [buffer] = await file.download();

    return buffer;
  }

  async downloadAllPhotoUrls(phoneNumber: string) {
    const fileOptions: GetFilesOptions = {
      directory: `${phoneNumber}/posts`
    };

    const [files, {}, metadata] = await this.bucket.getFiles(fileOptions);

    const downloadOptions: GetSignedUrlConfig = {
      version: "v4",
      action: "read",
      expires: Date.now() + 30 * 60 * 1000 // 30 minutes
    };

    const urls = await Promise.all(files.map(file => file.getSignedUrl(downloadOptions)));

    return urls;
  }

  async downloadUserPhoto(phoneNumber: string) {
    return this.getUrl(`${phoneNumber}/PROFILE_IMAGE.jpg`);
  }
}
