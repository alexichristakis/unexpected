import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { CRUDService } from "./crud";
import { UserModel, UserType } from "../models/user";

@Service()
export class UserService extends CRUDService<UserModel, UserType> {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  createNewUser = async (user: UserType) => {
    const newUser = await this.create(user);

    return newUser;
  };

  getByPhoneNumber = async (phoneNumber: string) => {
    return this.findOne({ phoneNumber });
  };
}
