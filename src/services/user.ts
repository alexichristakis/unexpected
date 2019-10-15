import { Service } from "@tsed/di";

@Service()
export class UserService {
  private settings = { test: "hello" };

  public getSettings() {
    return this.settings;
  }
}
