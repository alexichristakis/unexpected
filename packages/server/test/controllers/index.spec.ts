import { ExpressApplication } from "@tsed/common";
import { bootstrap, inject, TestContext } from "@tsed/testing";
import { expect } from "chai";
import SuperTest from "supertest";
import { Server } from "../../src/Server";

describe("Rest", () => {
  // bootstrap your Server to load all endpoints before run your test
  let request: SuperTest.SuperTest<SuperTest.Test>;

  before(bootstrap(Server));
  before(
    inject([ExpressApplication], (expressApplication: ExpressApplication) => {
      request = SuperTest(expressApplication);
    })
  );

  after(TestContext.reset);

  describe("GET /posts/:phoneNumber", () => {
    it("should do something", async () => {
      const response = await request.get("/posts/2069409629").expect(200);

      expect(response.body).to.be.an("array");
    });
  });
});
1;
