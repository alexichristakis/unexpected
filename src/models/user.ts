import { Default, Format, Required, Schema } from "@tsed/common";
import { Model, ObjectID, Indexed } from "@tsed/mongoose";

export interface NotificationPreferencesType {
  timezone: string;
}
export interface UserType {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
  deviceOS: string;
  deviceToken: string;
  notificationPreferences: NotificationPreferencesType;
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
  @Format("/^+?[1-9]d{1,14}$/")
  phoneNumber: string;

  @Required()
  code: string;

  @Required()
  firstName: string;

  @Required()
  lastName: string;

  @Required()
  deviceOS: string;

  @Required()
  deviceToken: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();

  @Required()
  notificationPreferences: NotificationPreferences;
}
