import { Inject, Service } from "@tsed/common";
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
      console.log("SENDING NOTIFICATION");
      const { to } = args.attrs.data;
      this.notificationService.notifyUserModel(to, "time to take & share a photo");
    });

    this.agenda.define(AgendaJobs.GENERATE_NOTIFICATIONS, async () => {
      console.log("GENERATING NOTIFICATIONS");
      const users = await this.userService.getAll([
        "_id",
        "timezone",
        "deviceOS",
        "deviceToken",
        "firstName",
        "lastName"
      ]);

      users.forEach(user => {
        const { timezone } = user;
        const time = this.generateTime(timezone);

        this.agenda.schedule("every hour", AgendaJobs.SEND_NOTIFICATION, { to: user });
      });
    });

    this.agenda.processEvery("10 minutes");

    await new Promise((resolve, reject) => {
      this.agenda.on("ready", async () => {
        await this.agenda.start();
        await this.scheduleNotificationGeneration();
        resolve();
      });
    });
  }

  generateTime = (timezone: string): Date => {
    return new Date();
  };

  scheduleNotificationGeneration = async () => {
    // await this.agenda.now(AgendaJobs.GENERATE_NOTIFICATIONS);
    await this.agenda.every("day", AgendaJobs.GENERATE_NOTIFICATIONS);
  };
}
