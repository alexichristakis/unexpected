import { Inject, Service } from "@tsed/common";
import { Notification, Provider } from "apn";
import moment from "moment";

import { NotificationPayload, User } from "@unexpected/global";
import { SentryService } from "./sentry";

const settings = {
  fcm: {
    api: "some fcm key"
  },
  apns: {
    token: {
      key: process.env.APNS_KEY as string,
      keyId: process.env.APNS_KEY_ID as string,
      teamId: process.env.APNS_TEAM_ID as string
    },
    production: !!process.env.PORT
  }
};

@Service()
export class NotificationService {
  @Inject(SentryService)
  private sentryService: SentryService;

  private APNs = new Provider(settings.apns);

  async send(
    deviceToken: string = "",
    deviceOS: string,
    body: string,
    data?: NotificationPayload
  ): Promise<string> {
    if (deviceOS == "Android") {
      // deal with android notification
    } else {
      // deal with ios notification
      const payload = {
        pushType: "alert",
        topic: "christakis.expect.photos",
        payload: data,
        alert: {
          body
        }
      };

      const notification = new Notification(payload);

      if (deviceToken.length)
        return this.APNs.send(notification, deviceToken).then(result => {
          result.failed.forEach(failure => {
            this.sentryService.captureException(failure);
          });

          result.sent.forEach(sent => {
            console.log(sent);
          });

          return "";
        });

      return "failure";
    }

    return "";
  }

  async notify(user: User, body: string): Promise<string> {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, body);
  }

  async notifyPhotoTime(user: User) {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, "time to take & share a photo", {
      type: "photoTime",
      photoTime: true,
      date: moment().toISOString()
    });
  }

  async notifyWithNavigationToUser(user: User, body: string, route: User) {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, body, {
      type: "user",
      route
    });
  }
}
