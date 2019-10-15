import { Controller, Post, PathParams } from "@tsed/common";
import bcrypt from "bcrypt";

import { TwilioService } from "../services/twilio";

export type VerifyPhoneReturnType = Promise<string>;
export type CheckCodeReturnType = Promise<boolean>;

@Controller("/verify")
export class UserController {
  constructor(private twilioService: TwilioService) {}

  @Post("/:phoneNumber")
  async sendVerificationCode(@PathParams("phoneNumber") phoneNumer: string): VerifyPhoneReturnType {
    const encryptedCode = await this.twilioService.verify(phoneNumer);

    return encryptedCode;
  }

  @Post("/:phoneNumber/:code")
  async checkVerificationCode(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("code") code: string
  ): CheckCodeReturnType {
    const response = await this.twilioService.checkVerification(phoneNumber, code);

    return response;
  }
}
