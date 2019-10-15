import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { VerificationMessage as VerificationMessageModel } from "../models/verification-message";
import { SALT_ROUNDS } from "../lib/constants";
import { TwilioService } from "./twilio";

@Service()
export class AuthService {
  @Inject(VerificationMessageModel)
  private VerificationMessage: MongooseModel<VerificationMessageModel>;

  @Inject(TwilioService)
  private twilioService: TwilioService;

  async authenticate(to: string): Promise<string> {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const body = `Hello! your verification code for expect.photos is: ${code}`;

    console.log("code is:", code);

    return this.twilioService
      .text(to, body)
      .then(async () => {
        const encryptedCode = await bcrypt.hash(code, SALT_ROUNDS);

        const doc = new this.VerificationMessage({
          phoneNumber: to,
          code: encryptedCode
        });

        doc.save();

        return encryptedCode;
      })
      .catch(error => error);
  }

  async checkVerification(to: string, code: string): Promise<boolean> {
    const query = this.VerificationMessage.findOne({ phoneNumber: to }).sort({
      createdAt: -1
    });

    const model = await query.exec();
    if (model) {
      const comparison = await bcrypt.compare(code, model.code);

      return comparison;
    }

    return false;
  }

  generateJWT(phoneNumber: string): string {
    const privateKey = <string>process.env.PRIVATE_KEY;
    const token = jwt.sign({ phoneNumber }, privateKey, { algorithm: "RS256" });

    return token;
  }
}
