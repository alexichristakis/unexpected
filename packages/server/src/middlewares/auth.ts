import {
  Context,
  EndpointInfo,
  IMiddleware,
  Middleware,
  Req,
  RequestContext,
} from "@tsed/common";
import jwt from "jsonwebtoken";
import { Forbidden, Unauthorized } from "ts-httpexceptions";

import { User } from "@global";

@Middleware()
export class AuthMiddleware implements IMiddleware {
  public use(
    @Req() request: any,
    @EndpointInfo() endpoint: EndpointInfo,
    @Context() context: RequestContext
  ) {
    // retrieve options given to the @UseAuth decorator
    const options = endpoint.get(AuthMiddleware) || {};

    // request.ctx.get('headers')

    const { authorization } = request.headers;

    if (authorization) {
      const publicKey = process.env.AUTH_PUBLIC_KEY as string;
      const token = authorization.split(" ")[1];

      try {
        const payload: any = jwt.verify(token, publicKey);

        // pass auth token to context
        context.set("auth", payload.id.trim());

        const { select, verify = (a: any, b: any) => a === b } = options;
        if (select && verify)
          if (!verify(request.params[select], payload.id)) {
            throw new Forbidden("Forbidden");
          }
      } catch (err) {
        throw new Forbidden("Forbidden");
      }
    } else {
      throw new Unauthorized("Unauthorized");
    }
  }
}

export const Select = {
  phoneFromUserFromBody: (data: any): Partial<User> => {
    return data.body.user.phoneNumber;
  },
  phoneFromPath: (data: any): any => {
    return data.params.phoneNumber;
  },
};

export const Verify = {
  userPhoneNumberMatchesToken: (data: User, phoneNumber: string) => {
    return data.phoneNumber === phoneNumber;
  },
};
