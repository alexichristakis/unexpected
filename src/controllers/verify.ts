import { Inject, Controller, Post, PathParams } from "@tsed/common";

import { AuthService } from "../services/auth";

export type VerifyPhoneReturnType = string;
export type CheckCodeReturnType = {
  response: boolean;
  token?: string;
};

@Controller("/verify")
export class UserController {
  @Inject(AuthService)
  private authService: AuthService;

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

    if (response) {
      // generate JWT
      const token = this.authService.generateJWT(phoneNumber);
      return { response, token };
    }

    return { response };
  }
}
