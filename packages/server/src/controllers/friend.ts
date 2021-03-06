import {
  Context,
  Controller,
  Delete,
  Get,
  Inject,
  PathParams,
  Put,
  UseAuth,
} from "@tsed/common";
import filter from "lodash/filter";
import { Forbidden } from "ts-httpexceptions";

import { AuthMiddleware } from "../middlewares/auth";
import { FriendService, UserService } from "../services";

@Controller("/friend")
@UseAuth(AuthMiddleware)
export class FriendController {
  @Inject(FriendService)
  private friendService: FriendService;

  @Inject(UserService)
  private userService: UserService;

  // get all requests related ot a user
  @Get("/requests")
  async getRequests(@Context("auth") id: string) {
    const requests = await this.friendService.getRequests(id);

    const friendRequests = filter(requests, ({ to }) => to.id === id).map(
      ({ from }) => from
    );

    const requestedFriends = filter(requests, ({ from }) => from.id === id).map(
      ({ to }) => to
    );

    return { friendRequests, requestedFriends };
  }

  // send / accept friend request
  @Put("/:userId")
  async friendUser(
    @PathParams("userId") userId: string,
    @Context("auth") auth: string // user sending request
  ) {
    if (auth === userId) {
      throw new Forbidden("Forbidden");
    }

    // check to see if request already exists
    const request = await this.friendService.getRequest(userId, auth);

    // request doesnt exist
    if (!request) {
      const friendRequest = await this.friendService.sendFriendRequest(
        auth,
        userId
      );

      return { request: friendRequest };
    }

    const { to } = request;

    // if requester is the recipient of request
    if (auth === to.id) {
      return this.friendService.acceptFriendRequest(request);
    }

    throw new Forbidden("Forbidden");
  }

  // unfriend
  @Delete("/:userId")
  async deleteFriend(
    @PathParams("userId") userId: string,
    @Context("auth") auth: string // user sending request
  ) {
    if (auth === userId) {
      throw new Forbidden("Forbidden");
    }

    // check to see if request already exists
    const request = await this.friendService.getRequest(userId, auth);

    // delete request
    if (request) {
      await this.friendService.delete(request.id);

      console.log(request);
      return { request: { from: request.from.id, to: request.to.id } };
    }

    // delete friendship
    return this.userService.unfriend(auth, userId);
  }
}
