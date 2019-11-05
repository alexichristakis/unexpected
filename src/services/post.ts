import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { CRUDService } from "./crud";
import { Post as PostModel, PostType } from "../models/post";

@Service()
export class PostService extends CRUDService<PostModel, PostType> {
  @Inject(PostModel)
  model: MongooseModel<PostModel>;

  createNewPost = async (Post: PostType) => {
    // const PostExists = await this.getByPhoneNumber(Post.phoneNumber);
    // if (PostExists) return;
    // return this.create(Post);
  };
}
