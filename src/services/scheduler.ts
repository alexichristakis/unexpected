import { Inject, Service } from "@tsed/common";
import { MongooseService } from "@tsed/mongoose";
import Agenda from "agenda";

import { UserService } from "./user";
import { NotificationService } from "./notification";

const GENERATE_NOTIFICATIONS = "GENERATE_NOTIFICATIONS";
const SEND_NOTIFICATION = "SEND_NOTIFICATION";

@Service()
export class SchedulerService {
  @Inject(MongooseService)
  private mongooseService: MongooseService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  @Inject(UserService)
  private userService: UserService;

  private agenda = new Agenda().mongo(this.mongooseService.get()!.connection.db, "jobs");

  setup = () => {
    this.agenda.define(SEND_NOTIFICATION, args => {
      const { toUser } = args.attrs.data;
      this.notificationService.sendMessage(toUser, "time to take & share a photo");
    });

    this.agenda.define(GENERATE_NOTIFICATIONS, () => {});
  };

  scheduleNotificationGeneration = () => {
    // this.agenda.
  };

  scheduleAllNotifications = () => {};
}
