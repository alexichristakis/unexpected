import { Inject, Service } from "@tsed/common";
import { MongooseService } from "@tsed/mongoose";
import Agenda from "agenda";

import { UserService } from "./user";
import { NotificationService } from "./notification";
import { NotificationPreferencesType } from "../models/user";

export enum AgendaJobs {
  GENERATE_NOTIFICATIONS = "GENERATE_NOTIFICATIONS",
  SEND_NOTIFICATION = "SEND_NOTIFICATION"
}

@Service()
export class SchedulerService {
  @Inject(MongooseService)
  private mongooseService: MongooseService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  @Inject(UserService)
  private userService: UserService;

  private agenda: Agenda;

  $afterInit() {
    this.agenda = new Agenda().mongo(this.mongooseService.get()!.connection.db, "jobs");

    this.agenda.define(AgendaJobs.SEND_NOTIFICATION, args => {
      const { to } = args.attrs.data;
      this.notificationService.notifyUserModel(to, "time to take & share a photo");
    });

    this.agenda.define(AgendaJobs.GENERATE_NOTIFICATIONS, async () => {
      const users = await this.userService.getAll([
        "timezone",
        "deviceOS",
        "firstName",
        "lastName"
      ]);

      users.forEach(user => {
        const { timezone } = user;
        const time = this.generateTime(timezone);

        this.agenda.schedule(time, AgendaJobs.SEND_NOTIFICATION, { to: user });
      });
    });

    // schedule the notification generation
    this.scheduleNotificationGeneration();
  }

  generateTime = (timezone: string): Date => {
    return new Date();
  };

  scheduleNotificationGeneration = () => {
    this.agenda.every("day", AgendaJobs.GENERATE_NOTIFICATIONS);
  };
}
