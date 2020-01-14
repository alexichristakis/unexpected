import {
  Default,
  Format,
  Required,
  Schema,
  Property,
  Inject
} from "@tsed/common";
import {
  Model,
  ObjectID,
  Indexed,
  Unique,
  PostHook,
  MongooseModel
} from "@tsed/mongoose";

import { SlackLogService } from "../services/logger";
import { User, UserType } from "./user";

@Model()
export class Post {
  @ObjectID("id")
  _id: string;

  @Indexed()
  @Required()
  @Format("/^+?[1-9]d{1,14}$/")
  userPhoneNumber: string;

  @Property()
  description: string;

  // @Property()
  // location: string;

  @Required()
  photoId: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();

  // this would be a more elegant solution
  @PostHook("save")
  static postSave(doc: Post) {
    // const { userPhoneNumber, createdAt } = doc;

    // const userModel = (new User()).getModelForClass(User);

    // const user = this.User.findOne({ phoneNumber: userPhoneNumber });
    const logger = new SlackLogService();
    logger.sendMessage(
      "new post",
      `${doc.userPhoneNumber} "${doc.description}"`
    );
  }
}
