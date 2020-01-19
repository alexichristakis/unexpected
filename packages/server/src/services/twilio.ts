import { Service } from "@tsed/common";
import twilio from "twilio";

const accountSid: string = process.env.PORT
  ? process.env.TWILIO_ACCOUNT_SID as string
  : process.env.TWILIO_DEV_ACCOUNT_SID as string;

const token: string = process.env.PORT
  ? process.env.TWILIO_ACCOUNT_TOKEN as string
  : process.env.TWILIO_DEV_ACCOUNT_TOKEN as string;

@Service()
export class TwilioService {
  private client = twilio(accountSid, token);
  private fromNumber = "+12063502524";

  async text(to: string, body: string): Promise<void> {
    this.client.messages
      .create({ body, to, from: this.fromNumber })
      .then(message => message)
      .catch(error => error);
  }
}
