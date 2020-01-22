import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Comment } from "@unexpected/global";

import { Comment as CommentModel } from "../models/Comment";
import { CRUDService } from "./crud";
import { SlackLogService } from "./logger";
import { UserService } from "./user";

@Service()
export class CommentService extends CRUDService<CommentModel, Comment> {
  @Inject(CommentModel)
  model: MongooseModel<CommentModel>;

  @Inject(UserService)
  userService: UserService;

  @Inject(SlackLogService)
  logger: SlackLogService;

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
