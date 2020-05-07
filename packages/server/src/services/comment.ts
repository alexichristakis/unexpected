import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import remove from "lodash/remove";

import { Comment, NewComment, CommentModel } from "@global";
import { CRUDService } from "./crud";
import { NotificationService } from "./notification";
import { UserService } from "./user";

@Service()
export class CommentService extends CRUDService<CommentModel, Comment> {
  @Inject(CommentModel)
  model: MongooseModel<CommentModel>;

  @Inject(UserService)
  private userService: UserService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  async createNewComment(comment: Comment) {
    return this.create(comment);
  }

  async getByPostIds(postIds: string[]) {
    const comments = await this.model.find({ postId: { $in: postIds } }).exec();

    return comments;
  }

  async getByPostId(postId: string) {
    return this.model.find({ postId }).sort({ createdAt: -1 }).exec();
  }

  async likeComment(phoneNumber: string, id: string) {
    const comment = await this.model.findById(id).exec();

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
