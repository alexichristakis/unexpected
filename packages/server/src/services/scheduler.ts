import { $log, Inject, Service } from "@tsed/common";
import { MongooseService } from "@tsed/mongoose";
import Agenda from "agenda";
import moment from "moment-timezone";
import uuid from "uuid/v4";

import { User } from "@unexpected/global";

import { AuthService } from "./auth";
import { SlackLogService } from "./logger";
import { NotificationService } from "./notification";
import { UserService } from "./user";

export enum AgendaJobs {
  GENERATE_NOTIFICATIONS = "GENERATE_NOTIFICATIONS",
  SEND_NOTIFICATION = "SEND_NOTIFICATION",
  CLEAR_CODES = "CLEAR_CODES"
}

@Service()
export class SchedulerService {
  @Inject(MongooseService)
  private mongooseService: MongooseService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  @Inject(UserService)
  private userService: UserService;

  @Inject(AuthService)
  private authService: AuthService;

  @Inject(SlackLogService)
  private slackLogger: SlackLogService;

  private agenda: Agenda;

  async $afterRoutesInit() {
    this.agenda = new Agenda().mongo(
      this.mongooseService.get()!.connection.db,
      "jobs"
    );

    this.agenda.processEvery("5 minutes");

    await new Promise(resolve => {
      this.agenda.once("ready", async () => {
        // await this.agenda.purge();

        this.agenda.define(AgendaJobs.SEND_NOTIFICATION, async args => {
          const { to } = args.attrs.data;
          await Promise.all([
            this.notificationService.notifyPhotoTime(to),
            this.slackLogger.sendMessage(
              "notification sent",
              `${to.phoneNumber} -- ${to.firstName} ${to.lastName}`
            )
          ]);
        });

        this.agenda.define(AgendaJobs.GENERATE_NOTIFICATIONS, async () => {
          const users = await this.userService.getAll([
            "_id",
            "phoneNumber",
            "timezone",
            "deviceOS",
            "deviceToken",
            "firstName",
            "lastName"
          ]);

          const generatedTimes = await Promise.all(
            users.map(user => this.scheduleNotificationForUser(user))
          );

          await Promise.all([
            this.userService.setNotificationTimes(generatedTimes),
            this.slackLogger.logNotifications(generatedTimes)
          ]);
        });

        this.agenda.define(AgendaJobs.CLEAR_CODES, async () => {
          await this.authService.clearOldCodes();
        });

        await this.agenda.start();

        /* every day at 4am */
        await this.agenda.every(
          "0 4 * * *",
          [AgendaJobs.GENERATE_NOTIFICATIONS, AgendaJobs.CLEAR_CODES],
          {},
          { timezone: "America/New_York" }
        );

        resolve();
      });
    });
  }

  // takes a user, schedules n notifications for them, returns the times
  scheduleNotificationForUser = async (user: User) => {
    const { phoneNumber, timezone } = user;

    // to eventually pull from user entity
    const NUM_NOTIFICATIONS = 2;

    const times = this.generateTimes(timezone, NUM_NOTIFICATIONS);

    const jobs = await Promise.all(
      times.map(time => {
        const dateInstance = moment(time);

        $log.info(
          `notification for ${user.firstName} at: ${dateInstance.format(
            "dddd, MMMM Do YYYY, h:mm:ss a"
          )}`
        );

        return this.agenda.schedule(
          dateInstance.toDate(),
          AgendaJobs.SEND_NOTIFICATION,
          { to: user, id: uuid() }
        );
      })
    );

    return { phoneNumber, notifications: times };
  };

  private generateTimes = (
    timezone: string = "America/New_York",
    n: number
  ): string[] => {
    const time = moment.tz(timezone);

    const start = time.clone();
    if (time.get("hour") < 10) {
      start.hour(10);
    } else {
      start.add(1, "day").hour(10);
    }

    // const start = moment.tz(moment().add(1, "day"), timezone).hour(10);
    const end = start.clone().hour(22);

    const endTime = +end;

    const randomNumber = (to: number, from = 0) =>
      Math.floor(Math.random() * (to - from) + from);

    const startTime = +start;

    const times: string[] = [];
    for (let i = 0; i < n; i++) {
      times.push(moment(randomNumber(endTime, startTime)).toISOString());
    }

    return times;
  };
}
