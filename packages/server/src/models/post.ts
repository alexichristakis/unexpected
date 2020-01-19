import {
  Default,
  Format,
  Inject,
  Property,
  Required,
  Schema
} from "@tsed/common";
import {
  Indexed,
  Model,
  MongooseModel,
  ObjectID,
  PostHook,
  Unique
} from "@tsed/mongoose";

import { SlackLogService } from "../services/logger";

@Model()
export class Post {

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
}
