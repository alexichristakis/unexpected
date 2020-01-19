import {
  BodyParams,
  Controller,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  UseAuth
} from "@tsed/common";
import moment from "moment";

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
    const [user] = await Promise.all([
      this.userService.getByPhoneNumber(phoneNumber),
      this.userService.setNotificationTimes([
        { phoneNumber, notifications: [moment().toISOString()] }
      ])
    ]);

    return this.notificationService.notifyUserModelPhotoTime(
      user,
      "time to take & share a photo"
    );
  }
}
