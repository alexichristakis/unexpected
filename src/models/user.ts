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
export class UserModel {
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

  @Required()
  deviceOS: string;

  @Property()
  deviceToken?: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();

  @Required()
  timezone: string;

  // @Required()
  // notificationPreferences: NotificationPreferences;
}

export type UserType = Omit<UserModel, "_id" | "createdAt">;
