import { Default, Format, Property, Required } from "@tsed/common";
import { Indexed, Model, ObjectID, Ref } from "@tsed/mongoose";

@Model()
export class User {
  @ObjectID("id")
  _id: string;

  @Indexed()
  @Required()
  @Format("/^+?[1-9]d{1,14}$/")
  phoneNumber: string;

  @Required()
  firstName: string;

  @Required()
  lastName: string;

  @Property()
  @Default("")
  bio: string;

  @Required()
  deviceOS: string;

  @Property()
  deviceToken?: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();

  // timezone of user
  @Required()
  @Default("America/New_York")
  timezone: string;

  // array of date strings of the scheduled notifications for today
  @Property()
  notifications: string[];

  // mutual
  @Property()
  @Ref(User)
  friends: Ref<User>[];
}
