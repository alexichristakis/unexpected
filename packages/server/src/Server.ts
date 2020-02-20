import {
  GlobalAcceptMimesMiddleware,
  ServerLoader,
  ServerSettings,
  LogIncomingRequestMiddleware,
  OverrideProvider,
  Req,
  $log,
  GlobalErrorHandlerMiddleware
} from "@tsed/common";
import "@tsed/mongoose";
import "@tsed/multipartfiles";

import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";

const PROD = !!process.env.PORT;

console.log("PROD:", PROD);

@ServerSettings({
  rootDir: __dirname,
  acceptMimes: ["application/json"],
  port: process.env.PORT || 5000,
  // debug: true,

  mount: {
    "/": PROD ? "dist/controllers/*" : "src/controllers/*"
  },

  mongoose: {
    url: PROD ? process.env.MONGODB_URI : "mongodb://127.0.0.1:27017/db1",
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  }

  // logger: {
  //   debug: true,
  //   logRequest: true,
  //   logStart: true,
  //   logEnd: true,
  //   disableRoutesSummary: true,
  //   requestFields: [
  //     "reqId",
  //     "method",
  //     "url",
  //     "headers",
  //     "body",
  //     "query",
  //     "params",
  //     "duration"
  //   ]
  // }
  // multer: {
  //   //
  // }
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
          extended: true
        })
      );

    // this.use(CustomLogIncomingRequestMiddleware);
    // this.use(GlobalErrorHandlerMiddleware);
  }
}

@OverrideProvider(LogIncomingRequestMiddleware)
class CustomLogIncomingRequestMiddleware extends LogIncomingRequestMiddleware {
  public use(@Req() request: any) {
    // you can set a custom ID with another lib
    request.id = require("uuid").v4();

    return super.use(request); // required
  }

  protected requestToObject(request: any) {
    $log.info({
      reqId: request.id,
      method: request.method,
      url: request.originalUrl || request.url,
      // duration: new Date().getTime() - request.tsedReqStart.getTime(),
      // headers: request.headers,
      body: request.body,
      query: request.query,
      params: request.params
    });

    // return {
    //   reqId: request.id,
    //   method: request.method,
    //   url: request.originalUrl || request.url,
    //   headers: request.headers,
    //   body: request.body,
    //   query: request.query,
    //   params: request.params
    // };
  }
}
1;
