import { Inject, Controller, Post, PathParams } from "@tsed/common";

import { AuthService } from "../services/auth";
import { UserService } from "../services/user";
import { UserType } from "../models/user";

export type VerifyPhoneReturnType = string;
export type CheckCodeReturnType = {
  verified: boolean;
  user?: UserType;
  token?: string;
};

@Controller("/verify")
export class UserController {
  @Inject(AuthService)
  private authService: AuthService;

  @Inject(UserService)
  private userService: UserService;

  @Post("/:phoneNumber")
  async sendVerificationCode(
    @PathParams("phoneNumber") phoneNumer: string
  ): Promise<VerifyPhoneReturnType> {
    const encryptedCode = await this.authService.authenticate(phoneNumer);

    return encryptedCode;
  }

  @Post("/:phoneNumber/:code")
  async checkVerificationCode(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("code") code: string
  ): Promise<CheckCodeReturnType> {
    const response = await this.authService.checkVerification(phoneNumber, code);

    if (response.verified) {
      // generate JWT
      const token = this.authService.generateJWT(phoneNumber);

      return { ...response, token };
    }

    return response;
  }
}
