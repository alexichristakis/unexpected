import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Comment } from "@unexpected/global";

import { Comment as CommentModel } from "../models/Comment";
import { CRUDService } from "./crud";
import { SlackLogService } from "./logger";
import { NotificationService } from "./notification";
import { PostService } from "./post";
import { UserService } from "./user";

@Service()
export class CommentService extends CRUDService<CommentModel, Comment> {
  @Inject(CommentModel)
  model: MongooseModel<CommentModel>;

  @Inject(PostService)
  private postService: PostService;

  @Inject(UserService)
  private userService: UserService;

  @Inject(NotificationService)
  private notificationService: NotificationService;

  async createNewComment(comment: Comment) {
    const [fromUser, post] = await Promise.all([
      this.userService.getByPhoneNumber(comment.phoneNumber),
      this.postService.getId(comment.postId)
    ]);

    if (!fromUser || !post) return;

    const user = await this.userService.getByPhoneNumber(post?.phoneNumber);

    return Promise.all([
      this.create(comment),
      this.notificationService.notifyWithNavigationToPost(
        user,
        `${fromUser.firstName} commented on your post`,
        { ...post, id: comment.postId }
      )
    ]);
  }

  async getByPostIds(postIds: string[]) {
    const comments = await this.model.find({ postId: { $in: postIds } }).exec();

    return comments;
  }

  async getByPostId(postId: string) {
    const comments = await this.model
      .find({ postId })
      .sort({ createdAt: -1 })
      .exec();

    return comments;
  }
}
