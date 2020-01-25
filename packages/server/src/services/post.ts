import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Post } from "@unexpected/global";
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
      this.logger.sendMessage(post.phoneNumber, post.description)
    ]);
  };

  getUsersPosts = async (phoneNumber: string) => {
    const posts = await this.find({ phoneNumber });

    const postMap = keyBy(posts, ({ id }) => id);

    return postMap;
  };

  async getFeedForUser(phoneNumber: string) {
    const user = await this.userService.findOne({ phoneNumber }, ["friends"]);

    if (!user) return [];

    const { friends } = user;

    // gets all friends posts
    const posts = await this.model
      .find({ phoneNumber: { $in: [...friends, phoneNumber] } })
      .sort({ createdAt: -1 })
      .exec();

    // gets their ids
    const postIds: string[] = posts.map(({ id }) => id);

    const comments = await this.commentService.getByPostIds(postIds);

    // gets all unique user entities in the feed
    const usersToFetch = uniqBy(
      [...posts, ...comments],
      post => post.phoneNumber
    ).map(({ phoneNumber }) => phoneNumber);

    // fetches users and comments
    const users = await this.userService.getByPhoneNumber(usersToFetch);

    // generates maps to load data into returned list
    const postMap = keyBy(posts, ({ id }) => id);
    const userMap = keyBy(users, ({ phoneNumber }) => phoneNumber);
    const commentMap = groupBy(comments, ({ postId }) => postId);

    const ret = {
      postIds,
      posts: postMap,
      users: userMap,
      comments: commentMap
    };

    return ret;
  }
}
