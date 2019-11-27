import {
  Controller,
  BodyParams,
  Get,
  Put,
  PathParams,
  UseAuth,
  Inject,
  Patch
} from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { NotificationService } from "../services/notification";
import { AuthMiddleware, Verify, Select } from "../middlewares/auth";

@Controller("/notify")
export class UserController {
  @Inject(NotificationService)
  private notificationService: NotificationService;

  // @Get("/:phoneNumber")
  // async notifyUser(@PathParams("phoneNumber") phoneNumber: string) {
  //   return this.notificationService.notifyPhoneNumber(phoneNumber, "hello this is a test");
  // }

  // @Put()
  // async followUser() {}

  // @Put()
  // async unFollowUser() {}
}
