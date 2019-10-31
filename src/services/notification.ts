import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Provider, Notification } from "apn";
import moment from "moment";

import { UserModel } from "../models/user";
import { Document } from "mongoose";
import { UserService } from "./user";

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
    production: false
  }
};

@Service()
export class NotificationService {
  @Inject(UserService)
  private userService: UserService;

  private APNs = new Provider(settings.apns);

  private async send(deviceToken: string = "", deviceOS: string, body: string): Promise<string> {
    if (deviceOS == "Android") {
      // deal with android notification
    } else {
      // deal with ios notification
      const payload = {
        pushType: "alert",
        topic: "christakis.expect.photos",
        payload: {
          photoTime: true,
          time: moment().toDate()
        },
        alert: {
          body
        }
      };

      const notification = new Notification(payload);

      console.log(notification, deviceToken);

      if (deviceToken.length)
        return this.APNs.send(notification, deviceToken).then(result => {
          // console.log("RESULT:", result);
          result.failed.forEach(failure => {
            console.log(failure.response);
          });

          return "";
        });

      return "failure";
    }

    return "";
  }

  async notifyPhoneNumber(phoneNumber: string, body: string): Promise<string> {
    const model = await this.userService.findOne({ phoneNumber }, ["deviceOS", "deviceToken"]);

    if (!model) return "";

    const { deviceOS, deviceToken } = model;

    return this.send(deviceToken, deviceOS, body);
  }

  async notifyUserModel(user: UserModel & Partial<Document>, body: string): Promise<string> {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, body);
  }
}
