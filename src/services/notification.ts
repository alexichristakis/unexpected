import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Provider, Notification } from "apn";

import { UserModel } from "../models/user";
import { Document } from "mongoose";

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
    production: true
  }
};

@Service()
export class NotificationService {
  @Inject(UserModel)
  private User: MongooseModel<UserModel>;

  private APNs = new Provider(settings.apns);

  private async send(deviceToken: string = "", deviceOS: string, body: string): Promise<string> {
    if (deviceOS == "Android") {
      // deal with android notification
    } else {
      // deal with ios notification
      const payload = {};
      const notification = new Notification(payload);

      if (deviceToken.length)
        return this.APNs.send(notification, deviceToken).then(result => {
          if (result.sent) {
            return "success";
          } else {
            return "failure";
          }
        });

      return "failure";
    }

    return "";
  }

  async notifyID(id: string, body: string): Promise<string> {
    const query = this.User.findOne({ id });

    const model = await query.exec();
    if (!model) return "";

    const { deviceOS, deviceToken } = model;

    return this.send(deviceToken, deviceOS, body);
  }

  async notifyUserModel(user: UserModel & Partial<Document>, body: string): Promise<string> {
    const { deviceOS, deviceToken } = user;

    return this.send(deviceToken, deviceOS, body);
  }
}
