import { Default, Format, Required, Schema, Property } from "@tsed/common";
import { Model, ObjectID, Indexed, Unique, PostHook } from "@tsed/mongoose";
import { SlackLogService } from "../services/logger";

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

  // @Required()
  // notificationPreferences: NotificationPreferences;

  @PostHook("save")
  static postSave(doc: User) {
    const logger = new SlackLogService();
    logger.sendMessage("new user", `${doc.firstName} ${doc.lastName}`);
  }
}

export type UserNotificationRecord = {
  phoneNumber: string;
  notifications: string[];
};

export type UserType = Omit<User, "_id" | "createdAt">;
export type PartialUserType = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
};
