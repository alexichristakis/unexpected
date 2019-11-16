import { Service, Inject } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import { Document } from "mongoose";

import { CRUDService } from "./crud";
import { User as UserModel, UserType } from "../models/user";

@Service()
export class UserService extends CRUDService<UserModel, UserType> {
  @Inject(UserModel)
  model: MongooseModel<UserModel>;

  async createNewUser(newUser: UserType) {
    const user = await this.getByPhoneNumber(newUser.phoneNumber);

    if (user) return user;

    return this.create(newUser);
  }

  async getByPhoneNumber(phoneNumber: string): Promise<UserModel & Document>;
  async getByPhoneNumber(
    phoneNumbers: string[]
  ): Promise<(UserModel & Document)[]>;
  async getByPhoneNumber(phoneNumber: string | string[]) {
    if (phoneNumber instanceof Array) {
      return this.model.find({ phoneNumber: { $in: phoneNumber } });
    }

    return this.findOne({ phoneNumber });
  }
}
