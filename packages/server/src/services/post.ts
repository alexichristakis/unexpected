import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import uniqBy from "lodash/uniqBy";

import { PostModel, Post, NewPost, Post_populated } from "@global";

import { CommentService } from "./comment";
import { SlackLogService } from "./logger";
import { UserService } from "./user";

@Service()
export class PostService {
  @Inject(PostModel)
  model: MongooseModel<PostModel>;

  @Inject(UserService)
  userService: UserService;

  @Inject(CommentService)
  commentService: CommentService;

  @Inject(SlackLogService)
  logger: SlackLogService;

  getAll = async (select?: string | null, populate?: string | null) => {
    return this.model.find().select(select).populate(populate).exec();
  };

  updateAll = async () => {
    return this.model
      .updateMany({}, { user: "5df4235c379aefb72228de51" })
      .exec();
  };

  createNewPost = async (post: NewPost) => {
    return Promise.all([
      this.model.create(post),
      this.userService.updateValidNotifications(post),
      this.logger.sendMessage(post.user.toString(), post.description),
    ]);
  };

  getUsersPosts = async (user: string) => {
    const posts = await this.model.find({ user });

    const postMap = keyBy(posts, ({ id }) => id);

    return postMap;
  };

  getPost = async (id: string) => {
    const [post, comments] = await Promise.all([
      this.model.findById(id).exec(),
      this.commentService.getByPostId(id),
    ]);

    return { post, comments };
  };

  getFeedForUser = async (id: string) => {
    const user = await this.userService.get(id, "friends");

    if (!user) return null;

    const { friends } = user;

    const posts = ((await this.model
      .find({ user: { $in: [...friends, id] } })
      .populate("user")
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown) as Post_populated[];

    // const comments = await this.commentService.getByPostIds(postIds);

    // const commentMap = groupBy(comments, ({ post }) => post);

    const users = uniqBy(
      posts.map(({ user }) => user),
      ({ id }) => id
    );

    console.log(posts);

    const postsUnpopulated = keyBy(
      posts.map(({ _id, user, ...rest }) => ({
        ...rest,
        id: _id,
        user: user._id,
      })),
      ({ id }) => id
    );

    console.log(postsUnpopulated);

    return { posts: postsUnpopulated, users };
  };

  delete = async (_id: string) => {
    return this.model.deleteOne({ _id });
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
