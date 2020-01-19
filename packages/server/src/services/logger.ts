import { Service } from "@tsed/common";
import { WebClient, ChatPostMessageArguments } from "@slack/web-api";
import moment from "moment-timezone";

import { UserNotificationRecord } from "@unexpected/global";

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

  async logNotifications(times: UserNotificationRecord[]) {
    return this.sendMessage(
      "notifications generated",
      `\`\`\`${times.reduce((prev, curr) => {
        return (prev += ` { ${
          curr.phoneNumber
        }: ${curr.notifications
          .map(noti => moment.tz(noti, "America/New_York").format("h:mm:ss a"))
          .join(", ")} }`);
      }, "")}\`\`\``
    );
  }
}
