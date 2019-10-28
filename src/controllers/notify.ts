import { Inject, Controller, Post, PathParams } from "@tsed/common";
import { NotificationService } from "../services/notification";

@Controller("/notify")
export class UserController {
  @Inject(NotificationService)
  private notifcationService: NotificationService;

  @Post("/:phoneNumber")
  async sendVerificationCode(@PathParams("phoneNumber") phoneNumer: string): Promise<string> {
    return this.notifcationService.notifyID(phoneNumer, "hello this is a test");
  }
}
