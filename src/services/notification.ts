import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Provider, Notification } from "apn";
import path from "path";

import { UserModel } from "../models/user";

const apnConfig = {
  token: {
    key: path.join(__dirname, "../certifications/AuthKey_YYDCNGYXB8.p8"),
    keyId: "YYDCNGYXB8",
    teamId: "N4L736JEYW"
  },
  production: true
};

const settings = {
  fcm: {
    api: "some fcm key"
  },
  apns: {
    token: {
      key: path.join(__dirname, "../certifications/AuthKey_YYDCNGYXB8.p8"),
      keyId: "YYDCNGYXB8",
      teamId: "N4L736JEYW"
    },
    production: true
  }
};

@Service()
export class NotificationService {
  @Inject(UserModel)
  private User: MongooseModel<UserModel>;

  private APNs = new Provider(apnConfig);

  async notify(uid: string, body: string): Promise<string> {
    const query = this.User.findOne({ id: uid });

    const model = await query.exec();
    if (model) {
      const { deviceOS, deviceToken } = model;

      if (deviceOS == "Android") {
        // deal with android notification
      } else {
        // deal with ios notification
        const payload = {};
        const notification = new Notification(payload);

        return this.APNs.send(notification, deviceToken).then(result => {
          if (result.sent) {
            return "success";
          } else {
            return "failure";
          }
        });
      }
    }

    return "";
  }
}
