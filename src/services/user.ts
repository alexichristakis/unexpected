import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { CRUDService } from "./crud";
import { User as UserModel, UserType } from "../models/user";

@Service()
export class UserService extends CRUDService<UserModel, UserType> {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  createNewUser = async (user: UserType) => {
    const userExists = await this.getByPhoneNumber(user.phoneNumber);

    if (userExists) return;

    return this.create(user);
  };

  getByPhoneNumber = async (phoneNumber: string) => {
    return this.findOne({ phoneNumber });
  };
}
