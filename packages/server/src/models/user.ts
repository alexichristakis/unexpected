import { Default, Format, Property, Required, Schema } from "@tsed/common";
import { Indexed, Model, ObjectID, PostHook, Unique } from "@tsed/mongoose";
import { SlackLogService } from "../services/logger";

@Model()
export class User {
  // @Required()
  // notificationPreferences: NotificationPreferences;
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
  friends: string[];

  // people who have requested this user
  @Property()
  friendRequests: string[];

  // requests sent by this user
  @Property()
  requestedFriends: string[];
}
