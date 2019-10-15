import { EndpointInfo, IMiddleware, Middleware, Req } from "@tsed/common";
import { Forbidden, Unauthorized } from "ts-httpexceptions";
import jwt from "jsonwebtoken";
import fs from "fs";

@Middleware()
export class AuthMiddleware implements IMiddleware {
  public use(@Req() request: Req, @EndpointInfo() endpoint: EndpointInfo) {
    // retrieve options given to the @UseAuth decorator
    const options = endpoint.get(AuthMiddleware) || {};

    const { authorization } = request.headers;
    console.log(options, authorization);

    if (authorization) {
      const publicKey = <string>process.env.PUBLIC_KEY;
      const token = authorization.split(" ")[1];

      try {
        const payload = jwt.verify(token, publicKey);
        console.log(payload);
      } catch (err) {
        console.debug(err);
      }
    }

    // if (!request.isAuthenticated()) { // passport.js method to check auth
    //   throw new Unauthorized("Unauthorized");
    // }

    // if (request.user.role !== options.role) {
    //   throw new Forbidden("Forbidden");
    // }
  }
}
