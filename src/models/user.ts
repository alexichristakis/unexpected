import { Default, Format, Required, Schema, Property } from "@tsed/common";
import { Model, ObjectID, Indexed, Unique } from "@tsed/mongoose";

export interface NotificationPreferencesType {
  timezone: string;
}

@Schema({})
class NotificationPreferences {
  @ObjectID("id")
  _id: string;

  @Required()
  timezone: string;
}

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

  @Required()
  @Default("America/New_York")
  timezone: string;

  // mutual, more like "friends"
  @Property()
  friends: string[];

  @Property()
  friendRequests: string[];

  @Property()
  requestedFriends: string[];

  // @Required()
  // notificationPreferences: NotificationPreferences;
}

export type UserType = Omit<User, "_id" | "createdAt">;
