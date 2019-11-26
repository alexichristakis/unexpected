import { createSelector } from "reselect";

import { RootState } from "../types";
import { phoneNumber as phoneNumberSelector } from "./user";

const s = (state: RootState) => state.post || {};
const usersSelector = createSelector(s, state => state.users);

export const postLoading = (state: RootState) => s(state).loading;

export const errorSendingPost = (state: RootState) => s(state).error;

const phoneNumberFromProps = (_: RootState, props: { phoneNumber: string }) =>
  props.phoneNumber;

export const usersPostState = createSelector(
  [phoneNumberFromProps, usersSelector],
  (phoneNumber, users) => users[phoneNumber] || {}
);

export const usersPosts = createSelector(
  usersPostState,
  postState => postState.posts || []
);

export const currentUsersPostsState = createSelector(
  [phoneNumberSelector, usersSelector],
  (phoneNumber, users) => users[phoneNumber] || {}
);

export const currentUsersPostsStale = createSelector(
  currentUsersPostsState,
  postState => (postState.stale === undefined ? true : postState.stale)
);

export const currentUsersPosts = createSelector(
  currentUsersPostsState,
  postState => postState.posts || []
);

export const feedState = (state: RootState) => s(state).feed;
