import { Controller, BodyParams, Get, Put, PathParams } from "@tsed/common";
import bcrypt from "bcrypt";

import { UserType } from "../models/user";
import { TwilioService } from "../services/twilio";

@Controller("/user")
export class UserController {
  constructor(private twilioService: TwilioService) {}

  @Get()
  findAll(): string {
    return "This action returns all calendars";
  }

  @Put()
  createUser(@BodyParams("user") user: UserType): void {
    console.log(user);
  }

  @Put("/text/:phoneNumber")
  async sendText(
    @PathParams("phoneNumber") phoneNumber: string
  ): Promise<void> {
    await this.twilioService.text(phoneNumber, "hello");
  }
}
