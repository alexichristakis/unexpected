import { Default, Format, Required } from "@tsed/common";
import { Indexed, Model, ObjectID } from "@tsed/mongoose";

@Model()
export class FriendRequest {
  @ObjectID("id")
  _id: string;

  @Indexed()
  @Required()
  @Format("/^+?[1-9]d{1,14}$/")
  from: string;

  @Indexed()
  @Required()
  @Format("/^+?[1-9]d{1,14}$/")
  to: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
