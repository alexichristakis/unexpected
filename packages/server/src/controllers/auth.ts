import { Controller, Inject, PathParams, Post } from "@tsed/common";

import { AuthService } from "../services/auth";

@Controller("/auth")
export class UserController {
  @Inject(AuthService)
  private authService: AuthService;

  @Post("/:phoneNumber")
  async sendVerificationCode(@PathParams("phoneNumber") phoneNumer: string) {
    const encryptedCode = await this.authService.authenticate(phoneNumer);

    return encryptedCode;
  }

  @Post("/:phoneNumber/:code")
  async checkVerificationCode(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("code") code: string
  ) {
    const response = await this.authService.checkVerification(
      phoneNumber,
      code
    );

    if (response.verified && response.user) {
      const { user } = response;

      // generate JWT
      const token = this.authService.generateJWT(user._id);

      return { ...response, token };
    }

    return response;
  }
}
