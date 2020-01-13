import { Service } from "@tsed/common";
import { WebClient, ChatPostMessageArguments } from "@slack/web-api";

export type Topics = "Post" | "New User" | "";

@Service()
export class SlackLogService {
  private client = new WebClient(process.env.SLACK_TOKEN);

  async sendMessage(topic: string, body: string) {
    await this.client.chat.postMessage({
      username: "logger",
      channel: "CSBMSNQG6",
      text: `${topic}: ${body}`
    });
  }
}
