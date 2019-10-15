import {
  GlobalAcceptMimesMiddleware,
  ServerLoader,
  ServerSettings
} from "@tsed/common";
import "@tsed/mongoose";

import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import compress from "compression";
import methodOverride from "method-override";

@ServerSettings({
  rootDir: __dirname,
  acceptMimes: ["application/json"],
  port: process.env.PORT || 5000,
  mongoose: {
    url: process.env.PORT
      ? process.env.MONGODB_URI
      : "mongodb://127.0.0.1:27017/db1",
    connectionOptions: {}
  }
})
export class Server extends ServerLoader {
  /**
   * This method let you configure the express middleware required by your application to works.
   * @returns {Server}
   */
  public $beforeRoutesInit(): void | Promise<any> {
    this.use(GlobalAcceptMimesMiddleware)
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(
        bodyParser.urlencoded({
          extended: true
        })
      );
  }
}
