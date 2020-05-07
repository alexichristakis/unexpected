import { IMiddleware, Middleware, Res, ResponseData } from "@tsed/common";

@Middleware()
export class SendImageMiddleware implements IMiddleware {
  public use(@ResponseData() data: Buffer, @Res() response: Res) {
    if (data === undefined) {
      return response.send();
    }

    response.contentType("image/jpeg");
    return response.end(data, "binary");
  }
}
