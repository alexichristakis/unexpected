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

<<<<<<< HEAD
=======
  @Property()
>>>>>>> 613d875d4490ce18425bf2949390e9c03144cd7b
  @Ref(User)
  likes: Ref<User>[];

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
