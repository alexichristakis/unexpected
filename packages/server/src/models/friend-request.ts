import { Default, Format, Required } from "@tsed/common";
import { Indexed, Model, ObjectID, Ref } from "@tsed/mongoose";

import { User } from "./user";

@Model()
export class FriendRequest {
  @ObjectID("id")
  _id: string;

  @Required()
  @Ref(User)
  from: Ref<User>;

  @Required()
  @Ref(User)
  to: Ref<User>;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
