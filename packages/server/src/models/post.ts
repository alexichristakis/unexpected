import { Default, Format, Property, Required } from "@tsed/common";
import { Indexed, Model, ObjectID, Ref } from "@tsed/mongoose";

import { User } from "./user";
@Model()
export class Post {
  @ObjectID("id")
  _id: string;

  @Required()
  @Ref(User)
  author: Ref<User>;

  @Property()
  description: string;

  // @Property()
  // location: string;

  // id to object in google cloud storage
  @Required()
  photoId: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
