import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { FeedPost, Post } from "@unexpected/global";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import uniqBy from "lodash/uniqBy";

import { Post as PostModel } from "../models/post";
import { CommentService } from "./comment";
import { CRUDService } from "./crud";
import { SlackLogService } from "./logger";
import { UserService } from "./user";

@Service()
export class PostService extends CRUDService<PostModel, Post> {
  @Inject(PostModel)
  model: MongooseModel<PostModel>;

  @Inject(UserService)
  userService: UserService;

  @Inject(CommentService)
  commentService: CommentService;

  @Inject(SlackLogService)
  logger: SlackLogService;

  createNewPost = async (post: Post) => {
    return Promise.all([
      this.create(post),
      this.userService.updateValidNotifications(post),
      this.logger.sendMessage(post.userPhoneNumber, post.description)
    ]);
  };

  getUsersPosts = async (phoneNumber: string) => {
    const posts = await this.find({ userPhoneNumber: phoneNumber });

    return posts;
  };

  async getFeedForUser(phoneNumber: string) {
    const user = await this.userService.findOne({ phoneNumber }, ["friends"]);

    if (!user) return [];

    const { friends } = user;

    // gets all friends posts
    const posts = await this.model
      .find({ userPhoneNumber: { $in: [...friends, phoneNumber] } })
      .sort({ createdAt: -1 })
      .exec();

    // gets their ids
    const postIds = posts.map(({ id }) => id);

    // gets all unique user entities in the feed
    const usersToFetch = uniqBy(posts, post => post.userPhoneNumber).reduce(
      (prev, curr) => [...prev, curr.userPhoneNumber],
      [] as string[]
    );

    // fetches users and comments
    const [users, comments] = await Promise.all([
      this.userService.getByPhoneNumber(usersToFetch),
      this.commentService.getByPostIds(postIds)
    ]);

    // generates maps to load data into returned list
    const userMap = keyBy(users, ({ phoneNumber }) => phoneNumber);
    const commentMap = groupBy(comments, ({ postId }) => postId);

    const ret: FeedPost[] = [];
    posts.forEach(
      ({ id, description, userPhoneNumber, createdAt, photoId }) => {
        ret.push({
          id,
          description,
          userPhoneNumber,
          createdAt,
          photoId,
          comments: commentMap[id],
          user: userMap[userPhoneNumber]
        });
      }
    );

    return ret;
  }
}
