import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import remove from "lodash/remove";

import { CommentModel, Comment, NewComment } from "@global";
import { NotificationService } from "./notification";
import { UserService } from "./user";

@Service()
export class CommentService {
  @Inject(CommentModel)
  model: MongooseModel<CommentModel>;

  @Inject(UserService)
  private userService: UserService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  async create(comment: Pick<Comment, "user" | "post" | "body">) {
    return this.model.create(comment);
  }

  async getByPostIds(postIds: string[]) {
    const comments = await this.model.find({ post: { $in: postIds } }).exec();

    return comments;
  }

  async getByPostId(post: string) {
    return this.model.find({ post }).sort({ createdAt: -1 }).exec();
  }

  async likeComment(phoneNumber: string, id: string, populate?: string) {
    const comment = await (populate
      ? this.model.findById(id).populate(populate).exec()
      : this.model.findById(id).exec());

    if (!comment) return null;

    const { likes } = comment;

    if (likes.includes(phoneNumber)) {
      comment.likes = remove(likes, phoneNumber);
    } else {
      likes.push(phoneNumber);
    }

    return comment.save();
  }
}
