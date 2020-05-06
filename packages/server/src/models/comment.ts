import { Default, Format, Property, Required } from "@tsed/common";
import { Indexed, Model, ObjectID } from "@tsed/mongoose";

@Model()
export class Comment {
  @ObjectID("id")
  _id: string;

  @Property()
  postId: string;

  @Indexed()
  @Required()
  @Format("/^+?[1-9]d{1,14}$/")
  phoneNumber: string;

  @Property()
  body: string;

  // phone numbers who have liked
  @Property()
  likes: string[];

  // if a reply to another comment
  @Property()
  replyTo?: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
