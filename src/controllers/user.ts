import { Controller, BodyParams, Get, Put, PathParams, UseAuth } from "@tsed/common";
import bcrypt from "bcrypt";

import { UserType } from "../models/user";
import { TwilioService } from "../services/twilio";
import { AuthMiddleware } from "../middlewares/auth";

@Controller("/user")
@UseAuth(AuthMiddleware)
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
  async sendText(@PathParams("phoneNumber") phoneNumber: string): Promise<void> {
    await this.twilioService.text(phoneNumber, "hello");
  }
}
