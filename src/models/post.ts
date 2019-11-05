import { Default, Format, Required, Schema, Property } from "@tsed/common";
import { Model, ObjectID, Indexed, Unique } from "@tsed/mongoose";

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

  @Required()
  timezone: string;
}

export type PostType = Omit<Post, "_id" | "createdAt">;
