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
import { UserService } from "../services/user";

@Controller("/notify")
export class UserController {
  @Inject(NotificationService)
  private notificationService: NotificationService;

  @Inject(UserService)
  private userService: UserService;

  @Get("/:phoneNumber")
  async notifyUser(@PathParams("phoneNumber") phoneNumber: string) {
    const user = await this.userService.getByPhoneNumber(phoneNumber);

    return this.notificationService.notifyUserModelPhotoTime(
      user,
      "time to take & share a photo"
    );
  }

  // @Put()
  // async followUser() {}

  // @Put()
  // async unFollowUser() {}
}
