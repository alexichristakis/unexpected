import { EndpointInfo, IMiddleware, Middleware, Req, UseAuth } from "@tsed/common";
import { Forbidden, Unauthorized } from "ts-httpexceptions";
import jwt from "jsonwebtoken";
import fs from "fs";
import { UserType } from "../models/user";

@Middleware()
export class AuthMiddleware implements IMiddleware {
  public use(@Req() request: Req, @EndpointInfo() endpoint: EndpointInfo) {
    // retrieve options given to the @UseAuth decorator
    const options = endpoint.get(AuthMiddleware) || {};

    const { authorization } = request.headers;

    if (authorization) {
      const publicKey = <string>process.env.AUTH_PUBLIC_KEY;
      const token = authorization.split(" ")[1];

      try {
        const payload: any = jwt.verify(token, publicKey);

        const { select, verify } = options;

        if (select && verify)
          if (!verify(select(request), payload.phoneNumber)) {
            throw new Forbidden("Forbidden");
          }
      } catch (err) {
        console.debug(err);
        throw new Forbidden("Forbidden");
      }
    } else {
      throw new Unauthorized("Unauthorized");
    }
  }
}

export const Select = {
  userFromBody: (data: any): Partial<UserType> => {
    return data.body.user;
  }
};

export const Verify = {
  userPhoneNumberMatchesToken: (data: UserType, phoneNumber: string) => {
    return data.phoneNumber === phoneNumber;
  }
};
