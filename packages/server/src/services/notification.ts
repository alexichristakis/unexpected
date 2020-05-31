import { $log, Inject, Service } from "@tsed/common";
import { Notification, Provider } from "apn";
import moment from "moment";

import { NotificationPayload, User } from "@global";
import { SentryService } from "./sentry";

const settings = {
  fcm: {
    api: "some fcm key",
  },
  apns: {
    token: {
      key: process.env.APNS_KEY as string,
      keyId: process.env.APNS_KEY_ID as string,
      teamId: process.env.APNS_TEAM_ID as string,
    },
    production: !!process.env.PORT,
  },
};

@Service()
export class NotificationService {
  @Inject(SentryService)
  private sentryService: SentryService;

  private APNs = new Provider(settings.apns);
  // private FCM = new Provider(settings.fcm);

  async send(
    deviceToken: string | string[] | undefined = "",
    deviceOS: string,
    body: string,
    data?: NotificationPayload
  ) {
    if (deviceOS === "Android") {
      // deal with android notification
      return null;
    } else {
      // deal with ios notification
      const payload = {
        pushType: "alert",
        topic: "christakis.expect.photos",
        payload: data,
        alert: {
          body,
        },
      };

      const notification = new Notification(payload);

      if (deviceToken.length) {
        const results = await this.APNs.send(notification, deviceToken);

        results.failed.forEach((failure) => {
          $log.info(failure);
          this.sentryService.captureException(failure);
        });

        results.sent.forEach((sent) => {
          $log.info(sent);
        });

        return Promise.resolve(results);
      }

      return null;
    }
  }

  notify(
    user:
      | { deviceOS: string; deviceToken?: string }
      | { deviceOS: string; deviceToken?: string }[],
    body: string
  ) {
    let token;
    const deviceOS = "ios";
    if (user instanceof Array) {
      token = user.map(({ deviceToken = "" }) => deviceToken);
    } else {
      token = user.deviceToken;
    }

    return this.send(token, deviceOS, body);
  }

  notifyPhotoTime(user: User) {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, "time to take & share a photo", {
      type: "photoTime",
      photoTime: true,
      date: moment().toISOString(),
    });
  }

  notifyWithNavigationToUser(user: User, body: string, route: User) {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, body, {
      type: "user",
      route,
    });
  }

  notifyWithNavigationToPost(
    user:
      | { deviceOS: string; deviceToken: string }
      | { deviceOS: string; deviceToken: string }[],
    body: string,
    route: { id: string; phoneNumber: string }
  ) {
    let token;
    const deviceOS = "ios";
    if (user instanceof Array) {
      token = user.map(({ deviceToken = "" }) => deviceToken);
    } else {
      token = user.deviceToken;
    }

    return this.send(token, deviceOS, body, {
      type: "post",
      route,
    });
  }
}
