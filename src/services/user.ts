import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";

import { CRUDService } from "./crud";
import { User as UserModel, UserType } from "../models/user";

@Service()
export class UserService extends CRUDService<UserModel, UserType> {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  createNewUser = async (newUser: UserType) => {
    console.log(newUser);
    const user = await this.getByPhoneNumber(newUser.phoneNumber);

    if (user) return user;

    return this.create(newUser);
  };

  getByPhoneNumber = async (phoneNumber: string) => {
    return this.findOne({ phoneNumber });
  };
}
