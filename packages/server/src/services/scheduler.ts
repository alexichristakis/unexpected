import { $log, Inject, Service } from "@tsed/common";
import { MongooseService } from "@tsed/mongoose";
import Agenda from "agenda";
import moment from "moment-timezone";

import { UserNotificationRecord, User } from "@unexpected/global";

import { UserService } from "./user";
import { NotificationService } from "./notification";
import { SlackLogService } from "./logger";

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
        await this.agenda.purge();

        this.agenda.define(AgendaJobs.SEND_NOTIFICATION, async args => {
          const { to } = args.attrs.data;
          await Promise.all([
            this.notificationService.notifyUserModelPhotoTime(
              to,
              "time to take & share a photo"
            ),
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

          let generatedTimes: UserNotificationRecord[] = [];

          users.forEach(user => {
            const res = this.scheduleNotificationForUser(user);
            generatedTimes.push(res);
          });

          await Promise.all([
            this.userService.setNotificationTimes(generatedTimes),
            this.slackLogger.sendMessage(
              "notifications generated",
              `\`\`\`${generatedTimes.reduce((prev, curr) => {
                return (prev += ` { ${
                  curr.phoneNumber
                }: ${curr.notifications
                  .map(noti =>
                    moment.tz(noti, "America/Los_Angeles").format("h:mm:ss a")
                  )
                  .join(", ")} }`);
              }, "")}\`\`\``
            )
          ]);
        });

        await this.agenda.start();
        await this.scheduleNotificationGeneration();

        resolve();
      });
    });
  }

  // takes a user, schedules n notifications for them, returns the times
  scheduleNotificationForUser = (user: User) => {
    const { phoneNumber, timezone } = user;

    // to eventually pull from user entity
    const NUM_NOTIFICATIONS = 2;

    const times = this.generateTimes(timezone, NUM_NOTIFICATIONS);

    times.forEach(time => {
      const dateInstance = moment(time);

      $log.info(
        `notification for ${user.firstName} at: ${dateInstance.format(
          "dddd, MMMM Do YYYY, h:mm:ss a"
        )}`
      );

      this.agenda.schedule(
        dateInstance.toDate(),
        AgendaJobs.SEND_NOTIFICATION,
        { to: user }
      );
    });

    return { phoneNumber, notifications: times };
  };

  private generateTimes = (
    timezone: string = "America/New_York",
    n: number
  ): string[] => {
    const start = moment.tz(moment().add(1, "day"), timezone).hour(10);
    const end = start.clone().hour(22);

    const endTime = +end;

    const randomNumber = (to: number, from = 0) =>
      Math.floor(Math.random() * (to - from) + from);

    const startTime = +start;

    let times: string[] = [];
    for (let i = 0; i < n; i++) {
      times.push(moment(randomNumber(endTime, startTime)).toISOString());
    }

    return times;
  };

  scheduleNotificationGeneration = async () => {
    // await this.agenda.now(AgendaJobs.GENERATE_NOTIFICATIONS);
    await this.agenda.every("day", AgendaJobs.GENERATE_NOTIFICATIONS);
  };
}
