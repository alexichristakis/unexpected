import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Document } from "mongoose";
import uniqBy from "lodash/uniqBy";
import keyBy from "lodash/keyBy";
import assign from "lodash/assign";

import { CRUDService } from "./crud";
import { Post as PostModel, PostType, FeedPostType } from "../models/post";
import { User as UserModel, UserType } from "../models/user";
import { UserService } from "./user";

@Service()
export class PostService extends CRUDService<PostModel, PostType> {
  @Inject(PostModel)
  model: MongooseModel<PostModel>;

  @Inject(UserService)
  userService: UserService;

  createNewPost = async (post: PostType) => {
    return Promise.all([
      this.create(post),
      this.userService.updateValidNotifications(post)
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

    const posts = await this.model
      .find({ userPhoneNumber: { $in: [...friends, phoneNumber] } })
      .sort({ createdAt: -1 })
      .exec();

    const usersToFetch = uniqBy(posts, post => post.userPhoneNumber).reduce(
      (prev, curr) => [...prev, curr.userPhoneNumber],
      [] as string[]
    );

    const users = keyBy(
      await this.userService.getByPhoneNumber(usersToFetch),
      ({ phoneNumber }) => phoneNumber
    );

    let ret: FeedPostType[] = [];
    posts.forEach(
      ({ id, description, userPhoneNumber, createdAt, photoId }) => {
        ret.push({
          id,
          description,
          userPhoneNumber,
          createdAt,
          photoId,
          user: users[userPhoneNumber]
        });
      }
    );

    return ret;
  }
}
