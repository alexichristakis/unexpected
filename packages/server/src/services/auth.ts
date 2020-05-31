import { $log, Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";

import { VerificationMessageModel } from "@global";
import { SALT_ROUNDS } from "../lib/constants";
import { TwilioService } from "./twilio";
import { UserService } from "./user";

@Service()
export class AuthService {
  @Inject(VerificationMessageModel)
  private verificationMessageModel: MongooseModel<VerificationMessageModel>;

  @Inject(UserService)
  private userService: UserService;

  @Inject(TwilioService)
  private twilioService: TwilioService;

  async authenticate(to: string): Promise<string> {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const body = `Hello! your verification code for expect.photos is: ${code}`;

    $log.info("code is:", code);

    return this.twilioService
      .text(to, body)
      .then(async () => {
        const encryptedCode = await bcrypt.hash(code, SALT_ROUNDS);

        const doc = new this.verificationMessageModel({
          phoneNumber: to,
          code: encryptedCode,
        });

        await doc.save();

        return encryptedCode;
      })
      .catch((error) => error);
  }

  async clearOldCodes() {
    return this.verificationMessageModel.deleteMany({}).exec();
  }

  async checkVerification(phoneNumber: string, sentCode: string) {
    const verificationMessage = await this.verificationMessageModel
      .findOne({ phoneNumber })
      .sort({ createdAt: -1 })
      .exec();

    // no record of the phone number requested to be verified
    if (!verificationMessage) return { verified: false };

    const { code, createdAt } = verificationMessage;

    // if the code expired
    if (moment().diff(moment(createdAt), "minutes") > 10) {
      return { verified: false };
    }

    const comparison = await bcrypt.compare(sentCode, code);

    // if the code doesnt match the user isnt verified
    if (!comparison) return { verified: false };

    // check to see if the user already has an account
    const userModel = await this.userService.getByPhone(phoneNumber);

    if (userModel) {
      return { verified: true, user: userModel };
    }

    const placeholder = await this.userService.createPlaceholder(phoneNumber);

    // otherwise verified and new user
    return { verified: true, newUser: true, user: placeholder };
  }

  generateJWT(id: string) {
    const privateKey = process.env.AUTH_PRIVATE_KEY as string;
    const token = jwt.sign({ id }, privateKey, { algorithm: "RS256" });

    return token;
  }
}
