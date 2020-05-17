import {
  BodyParams,
  Controller,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  QueryParams,
  UseAuth,
  Context,
} from "@tsed/common";

import { NewUser, User, CompleteUserSelect } from "@global";
import { AuthMiddleware } from "../middlewares/auth";
import { UserService } from "../services/user";

@Controller("/user")
@UseAuth(AuthMiddleware)
export class UserController {
  @Inject(UserService)
  private userService: UserService;

  @Get()
  async getUser(@Context("auth") auth: string) {
    return this.userService.get(auth, CompleteUserSelect);
  }

  @Get("/all")
  async getAll() {
    return this.userService.getAll();
  }

  @Get("/search/:query")
  async search(@PathParams("query") query: string) {
    return this.userService.search(query);
  }

  @Get("/camera")
  async getIsCameraEnabled(@Context("auth") auth: string) {
    return this.userService.cameraEnabled(auth);
  }

  @Get("/multiple")
  async getUsers(
    @QueryParams("ids") ids: string,
    @QueryParams("select") select?: string
  ) {
    if (!ids || !ids.length) return null;

    const uids = ids.includes(",") ? ids.split(",") : [ids];

    const selectOn = select?.split(",").join(" ") || "firstName lastName";

    return this.userService.getMultiple(uids, selectOn);
  }

  @Get("/phone/:phoneNumber")
  async getUserByPhone(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.getByPhone(phoneNumber);
  }

  @Get("/friends")
  async getUserFriends(@Context("auth") id: string) {
    return this.userService.getFriends(id);
  }

  @Put()
  async createUser(
    @Context("auth") id: string,
    @BodyParams("user") user: NewUser
  ) {
    return this.userService.create(user);
  }

  @Patch("/:id")
  @UseAuth(AuthMiddleware, { select: "id" })
  async updateUser(
    @PathParams("id") id: string,
    @BodyParams("user") user: Partial<User>
  ) {
    return this.userService.update(id, user);
  }
}
