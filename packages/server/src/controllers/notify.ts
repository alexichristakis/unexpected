import {
  BodyParams,
  Controller,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  UseAuth,
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

  @Get("/phone/:phoneNumber")
  async notifyUser(@PathParams("phoneNumber") phoneNumber: string) {
    const user = await this.userService.getByPhone(phoneNumber);

    if (!user) return null;

    return this.notificationService.notifyPhotoTime(user);
  }
}
