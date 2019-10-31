import { Inject, Service, AfterInit } from "@tsed/common";
import { MongooseService } from "@tsed/mongoose";
import Agenda from "agenda";

import { UserService } from "./user";
import { NotificationService } from "./notification";

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

  async $afterRoutesInit() {
    this.agenda = new Agenda().mongo(this.mongooseService.get()!.connection.db, "jobs");

    this.agenda.define(AgendaJobs.SEND_NOTIFICATION, args => {
      const { to } = args.attrs.data;
      this.notificationService.notifyUserModel(to, "time to take & share a photo");
    });

    this.agenda.define(AgendaJobs.GENERATE_NOTIFICATIONS, async () => {
      console.log("generating notifications");
      const users = await this.userService.getAll([
        "_id",
        "timezone",
        "deviceOS",
        "deviceToken",
        "firstName",
        "lastName"
      ]);

      console.log("num users:", users.length);

      users.forEach(user => {
        const { timezone } = user;
        console.log(user._id, user.deviceToken);
        const time = this.generateTime(timezone);
        console.log("scheduling notification");

        this.agenda.schedule("every hour", AgendaJobs.SEND_NOTIFICATION, { to: user });
      });
    });

    this.agenda.start();

    // schedule the notification generation
    this.scheduleNotificationGeneration();
  }

  generateTime = (timezone: string): Date => {
    return new Date();
  };

  scheduleNotificationGeneration = () => {
    this.agenda.now(AgendaJobs.GENERATE_NOTIFICATIONS);
    this.agenda.every("day", AgendaJobs.GENERATE_NOTIFICATIONS);
  };
}
