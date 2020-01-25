import { Default, Format, Property, Required } from "@tsed/common";
import { Indexed, Model, ObjectID } from "@tsed/mongoose";

@Model()
export class Post {
  @ObjectID("id")
  _id: string;

  @Indexed()
  @Required()
  @Format("/^+?[1-9]d{1,14}$/")
  phoneNumber: string;

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
