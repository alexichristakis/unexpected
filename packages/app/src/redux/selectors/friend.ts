import { createSelector } from "reselect";

import { getPostImageURL } from "@api";
import { FriendingState } from "@global";

import { RootState } from "../types";
import { post } from "./post";
import { users, userId } from "./user";

const s = (state: RootState) => state.friend || {};

const idFromProps = (_: RootState, props: { id: string }) => props.id;

const f = createSelector(s, (state) => state.friends);

export const requests = createSelector(s, (state) => state.requests);
export const requested = createSelector(s, (state) => state.requested);

export const friends = createSelector([f, idFromProps], (friends, id) => {
  return friends[id] ?? [];
});

export const usersFriends = createSelector([f, userId], (friends, id) => {
  return friends[id] ?? [];
});

export const friendingState = createSelector(
  [idFromProps, userId, usersFriends, requests, requested],
  (id, userId, friends, requests, requested) => {
    if (id === userId) {
      return FriendingState.NONE;
    }

    // states: they are friends, they requested, they've been requested, nothing
    if (friends.includes(id)) {
      return FriendingState.FRIENDS;
    } else if (requests.includes(id)) {
      return FriendingState.RECEIVED;
    } else if (requested.includes(id)) {
      return FriendingState.REQUESTED;
    } else {
      return FriendingState.CAN_FRIEND;
    }
  }
);

export const loadingFriendRequest = createSelector([s], (state) => {
  return state.loading;
});
