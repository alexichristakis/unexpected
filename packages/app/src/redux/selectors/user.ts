import { createSelector } from "reselect";

import { User } from "@unexpected/global";
import { RootState } from "../types";

const s = (state: RootState) => state.user;

export const friendRequests = createSelector(s, state =>
  state.friendRequests.map(({ from }) => from)
);

export const requestedFriends = createSelector(s, state =>
  state.requestedFriends.map(({ to }) => to)
);

export const userError = createSelector(s, state => state.error);

export const userLoading = createSelector(s, state => state.loading);

export const users = createSelector(s, state => state.users);

export const phoneNumber = createSelector(s, state => state.phoneNumber);

const phoneNumberFromProps = (_: RootState, props: { phoneNumber: string }) =>
  props.phoneNumber;

export const user = createSelector(
  [users, phoneNumberFromProps],
  (users, phoneNumber) => users[phoneNumber]
);

export const currentUser = createSelector(
  [users, phoneNumber],
  (users, phoneNumber) => users[phoneNumber]
);

export const deviceToken = createSelector(
  currentUser,
  currentUserEntity => currentUserEntity.deviceToken
);
