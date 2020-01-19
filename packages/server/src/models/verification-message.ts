import { Default, Format, Required } from "@tsed/common";
import { Indexed, Model, ObjectID } from "@tsed/mongoose";

@Model()
export class VerificationMessage {
  @ObjectID("id")
  _id: string;

  @Indexed()
  @Format("/^+?[1-9]d{1,14}$/")
  phoneNumber: string;

  @Required()
  code: string;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
