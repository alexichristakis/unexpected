import { Controller, Inject, PathParams, Post } from "@tsed/common";

import { AuthService } from "../services/auth";
import { UserService } from "../services/user";

@Controller("/verify")
export class UserController {
  @Inject(AuthService)
  private authService: AuthService;

  @Inject(UserService)
  private userService: UserService;

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

    if (response.verified) {
      const { user } = response;

      console.log("placeholder:", user);

      // generate JWT
      const token = this.authService.generateJWT(user?._id);

      return { ...response, token };
    }

    return response;
  }
}
