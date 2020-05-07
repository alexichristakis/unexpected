import { Default, Format, Property, Required } from "@tsed/common";
import { Indexed, Model, ObjectID, Ref } from "@tsed/mongoose";
import { User } from "./user";
import { Post } from "./post";

@Model()
export class Comment {
  @ObjectID("id")
  _id: string;

  @Required()
  @Ref(Post)
  post: Ref<Post>;

  @Required()
  @Ref(User)
  user: Ref<User>;

  @Property()
  body: string;

  @Property()
  @Ref(User)
  likes: Ref<User>[];

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
