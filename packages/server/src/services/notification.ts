import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Provider, Notification } from "apn";
import moment from "moment";
import { Document } from "mongoose";

import { UserService } from "./user";
import { User as UserModel } from "../models/user";
import { SentryService } from "./sentry";

const settings = {
  fcm: {
    api: "some fcm key"
  },
  apns: {
    token: {
      key: <string>process.env.APNS_KEY,
      keyId: <string>process.env.APNS_KEY_ID,
      teamId: <string>process.env.APNS_TEAM_ID
    },
    production: !!process.env.PORT ? true : false
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
    photoTime: boolean = false
  ): Promise<string> {
    if (deviceOS == "Android") {
      // deal with android notification
    } else {
      // deal with ios notification
      const payload = {
        pushType: "alert",
        topic: "christakis.expect.photos",
        payload: {
          photoTime,
          time: moment().toDate()
        },
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

          return "";
        });

      return "failure";
    }

    return "";
  }

  async notifyUserModel(
    user: UserModel & Partial<Document>,
    body: string
  ): Promise<string> {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, body);
  }

  async notifyUserModelPhotoTime(
    user: UserModel & Partial<Document>,
    body: string
  ) {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, body, true);
  }
}
