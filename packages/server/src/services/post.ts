import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import uniqBy from "lodash/uniqBy";

import { PostModel, Post, NewPost } from "@global";

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

  createNewPost = async (post: NewPost) => {
    return Promise.all([
      this.model.create(post),
      this.userService.updateValidNotifications(post),
      this.logger.sendMessage(post.user.toString(), post.description),
    ]);
  };

  getUsersPosts = async (user: string) => {
    const posts = await this.find({ user });

    const postMap = keyBy(posts, ({ id }) => id);

    return postMap;
  };

  getPost = async (id: string) => {
    const [post, comments] = await Promise.all([
      this.getId(id),
      this.commentService.getByPostId(id),
    ]);

    return { post, comments };
  };

  getFeedForUser = async (id: string) => {
    const user = await this.userService.get(id, "friends");

    if (!user) return null;

    const { friends } = user;

    const posts = await this.model
      .find({ user: { $in: [...friends, id] } })
      .populate("user")
      .sort({ createdAt: -1 })
      .exec();

    const postIds: string[] = posts.map(({ id }) => id);
    const comments = await this.commentService.getByPostIds(postIds);

    const postMap = keyBy(posts, ({ id }) => id);
    const commentMap = groupBy(comments, ({ post }) => post);

    return { posts: postMap, comments: commentMap };
  };

  /*
  getFeedForUser_old = async (phoneNumber: string) => {
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
      (post) => post.phoneNumber
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
      comments: commentMap,
    };

    return ret;
  };
  */
}
