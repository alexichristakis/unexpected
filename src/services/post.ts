import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { CRUDService } from "./crud";
import { Post as PostModel, PostType } from "../models/post";
import { UserService } from "./user";

@Service()
export class PostService extends CRUDService<PostModel, PostType> {
  @Inject(PostModel)
  model: MongooseModel<PostModel>;

  @Inject(UserService)
  userService: UserService;

  createNewPost = async (Post: PostType) => {
    return this.create(Post);
  };

  getUsersPosts = async (phoneNumber: string) => {
    const posts = await this.find({ userPhoneNumber: phoneNumber });

    return posts;
  };

  getFeedForUser = async (phoneNumber: string) => {
    const user = await this.userService.findOne({ phoneNumber }, ["following"]);

    if (!user) return;

    const { following } = user;

    const posts = await this.model
      .find({ userPhoneNumber: { $in: [...following, phoneNumber] } })
      .sort({ createdAt: -1 })
      .exec();

    return posts;
    // const posts = this.find({userPhoneNumber: following})

    // const promises: Promise<(PostModel & Document)[]>[] = [];
    // user.following.forEach(userPhoneNumber => {
    //   promises.push(this.getUsersPosts(phoneNumber));
    // });

    // const Promise.all(posts).then(res => {

    // });
  };
}
