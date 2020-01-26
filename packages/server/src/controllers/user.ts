import {
  BodyParams,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  PathParams,
  Put,
  QueryParams,
  UseAuth
} from "@tsed/common";
import { User } from "@unexpected/global";

import { PhoneNumberContext } from "twilio/lib/rest/lookups/v1/phoneNumber";
import { AuthMiddleware, Select } from "../middlewares/auth";
import { User as UserModel } from "../models/user";
import { FriendService } from "../services/friend";
import { UserService } from "../services/user";

export type CameraEnabledReturn = ReturnType<
  UserController["getIsCameraEnabled"]
>;

@Controller("/user")
@UseAuth(AuthMiddleware)
export class UserController {
  @Inject(UserService)
  private userService: UserService;

  @Inject(FriendService)
  private friendService: FriendService;

  @Get("/search/:query")
  async search(@PathParams("query") query: string) {
    return this.userService.search(query);
  }

  @Get("/:phoneNumber/camera")
  async getIsCameraEnabled(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.cameraEnabled(phoneNumber);
  }

  @Get()
  async getUsers(
    @QueryParams("phoneNumbers") phoneNumbers: string,
    @QueryParams("select") select: string
  ) {
    const userPhoneNumbers = phoneNumbers.split(",");
    const selectOn = select.split(",").join(" ");

    return this.userService.getByPhoneNumber(
      userPhoneNumbers,
      false,
      selectOn + " phoneNumber"
    );
  }

  @Get("/:phoneNumber")
  async getUser(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.getByPhoneNumber(phoneNumber);
  }

  @Get("/:phoneNumber/friends")
  async getUserFriends(@PathParams("phoneNumber") phoneNumber: string) {
    return this.userService.getUserFriends(phoneNumber);
  }

  @Put()
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromUserFromBody
  })
  async createUser(@BodyParams("user") user: User): Promise<UserModel | void> {
    return this.userService.createNewUser(user);
  }

  @Patch("/:phoneNumber")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async updateUser(
    @PathParams("phoneNumber") phoneNumber: string,
    @BodyParams("user") user: Partial<User>
  ): Promise<UserModel> {
    await this.userService.updateOne({ phoneNumber }, user);

    return this.userService.getByPhoneNumber(phoneNumber);
  }

  @Get("/:phoneNumber/requests")
  async getRequests(@PathParams("phoneNumber") phoneNumber: string) {
    const [friendRequests, requestedFriends] = await Promise.all([
      this.friendService.getFriendRequests(phoneNumber),
      this.friendService.getRequestedFriends(phoneNumber)
    ]);

    return { friendRequests, requestedFriends };
  }

  @Patch("/:phoneNumber/friend/:to")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async friendUser(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("to") to: string
  ) {
    if (phoneNumber !== to) {
      return this.friendService.sendFriendRequest(phoneNumber, to);
    }
  }

  @Delete("/request/:id")
  async deleteRequest(@PathParams("id") id: string) {
    return this.friendService.delete(id);
  }

  @Patch("/:from/accept/:phoneNumber")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async acceptFriendRequest(
    @PathParams("from") from: string,
    @PathParams("phoneNumber") phoneNumber: string
  ) {
    if (phoneNumber !== from) {
      return this.friendService.acceptFriendRequest(from, phoneNumber);
    }
  }

  @Patch("/:phoneNumber/delete/:to")
  @UseAuth(AuthMiddleware, {
    select: Select.phoneFromPath
  })
  async deleteFriend(
    @PathParams("phoneNumber") phoneNumber: string,
    @PathParams("to") to: string
  ) {
    if (phoneNumber !== to) {
      return this.userService.unfriend(phoneNumber, to);
    }
  }
}
