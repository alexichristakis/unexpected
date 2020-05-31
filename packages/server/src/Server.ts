import {
  GlobalAcceptMimesMiddleware,
  ServerLoader,
  ServerSettings,
} from "@tsed/common";
import "@tsed/mongoose";
import "@tsed/multipartfiles";

import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import methodOverride from "method-override";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const PROD = !!process.env.PORT;

@ServerSettings({
  rootDir: __dirname,
  acceptMimes: ["application/json"],
  port: process.env.PORT || 5000,
  debug: !PROD,

  mount: {
    "/": PROD ? "dist/controllers/*" : "src/controllers/*",
  },

  mongoose: {
    url: PROD ? process.env.MONGODB_URI : "mongodb://127.0.0.1:27017/db1",
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
  },

  logger: {
    debug: !PROD,
    level: "info",
    logRequest: !PROD,
    logStart: !PROD,
    logEnd: !PROD,
    disableRoutesSummary: PROD,
    requestFields: [
      "method",
      "reqId",
      "url",
      "body",
      "query",
      "params",
      "duration",
    ],
  },
})
export class Server extends ServerLoader {
  public $beforeRoutesInit(): void | Promise<any> {
    this.use(GlobalAcceptMimesMiddleware)
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(
        bodyParser.urlencoded({
          extended: true,
        })
      );
  }
}
