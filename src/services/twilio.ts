import { Inject, Service } from "@tsed/common";
import { MongooseModel } from "@tsed/mongoose";
import twilio from "twilio";
import bcrypt from "bcrypt";

import { VerificationMessage as VerificationMessageModel } from "../models/verification-message";
import { SALT_ROUNDS } from "../lib/constants";

const accountSid: string = process.env.PORT
  ? <string>process.env.TWILIO_ACCOUNT_SID
  : <string>process.env.TWILIO_DEV_ACCOUNT_SID;

const token: string = process.env.PORT
  ? <string>process.env.TWILIO_ACCOUNT_TOKEN
  : <string>process.env.TWILIO_DEV_ACCOUNT_TOKEN;

@Service()
export class TwilioService {
  private client = twilio(accountSid, token);
  private fromNumber = "+12063502524";

  @Inject(VerificationMessageModel)
  private VerificationMessage: MongooseModel<VerificationMessageModel>;

  async text(to: string, body: string): Promise<void> {
    this.client.messages
      .create({ body, to, from: this.fromNumber })
      .then(message => message)
      .catch(error => error);
  }

  async verify(to: string): Promise<string> {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const body = `Hello! your verification code for expect.photos is: ${code}`;

    console.log("code is:", code);

    return this.text(to, body)
      .then(async message => {
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
}
