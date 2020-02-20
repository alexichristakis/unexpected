import { Default, Format, Property, Required } from "@tsed/common";
import { Indexed, Model, ObjectID, Ref } from "@tsed/mongoose";

import { Post } from "./post";
import { User } from "./User";

@Model()
export class Comment {
  @ObjectID("id")
  _id: string;

  @Required()
  @Ref(Post)
  post: Ref<Post>;

  @Required()
  @Ref(User)
  author: Ref<User>;

  @Required()
  @Property()
  body: string;

  @Ref(User)
  likes: Ref<User>[];

  // if the comment is a reply to another comment
  // this field is the comment id of the parent
  @Ref(Comment)
  replyTo?: Ref<Comment>;

  @Format("date-time")
  @Default(Date.now)
  createdAt: Date = new Date();
}
