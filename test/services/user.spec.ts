import { inject, TestContext } from "@tsed/testing";
import { expect } from "chai";

import { UserService } from "../../src/services/user";

describe("UserService", () => {
  let result: any;
  before(TestContext.create);
  after(TestContext.reset);

  it("should get user from db", inject(
    [UserService],
    async (userService: UserService) => {
      result = await userService.getByPhoneNumber("20694096929");
      expect(result).to.be.an("object");
    }
  ));
});
