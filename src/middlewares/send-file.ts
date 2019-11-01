import { IMiddleware, Middleware, ResponseData, Res, ConverterService } from "@tsed/common";

/**
 * See example to override SendResponseMiddleware [here](/docs/middlewares/override/send-response.md).
 * @middleware
 */
@Middleware()
export class SendFileMiddleware implements IMiddleware {
  public use(@ResponseData() data: Buffer, @Res() response: Res) {
    if (data === undefined) {
      return response.send();
    }

    response.contentType("image/jpeg");
    response.end(data, "binary");

    return response.send();
  }
}
