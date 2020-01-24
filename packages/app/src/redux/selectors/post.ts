import { createSelector } from "reselect";

import { RootState } from "../types";
import {
  phoneNumber as phoneNumberSelector,
  users as usersEntitySelector,
  user as userEntitySelector
} from "./user";

const s = (state: RootState) => state.post || {};
const usersSelector = createSelector(s, state => state.users);

const posts = (state: RootState) => s(state).posts;
const comments = (state: RootState) => s(state).comments;

export const postLoading = (state: RootState) => s(state).loading;

export const feedLoading = (state: RootState) => s(state).feed.loading;

export const errorSendingPost = (state: RootState) => s(state).error;

const phoneNumberFromProps = (_: RootState, props: { phoneNumber: string }) =>
  props.phoneNumber;

export const usersPosts = createSelector(
  [usersSelector, posts, userEntitySelector],
  (users, posts, user) => {
    const phoneNumber = user.phoneNumber;
    const postIds = users[phoneNumber].posts ?? [];

    console.log(postIds, posts, user);

    return postIds.map(id => posts[id]);
  }
);

export const usersPostState = createSelector(
  [usersSelector, phoneNumberFromProps],
  (users, phoneNumber) => users[phoneNumber] || {}
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

export const feed = createSelector(
  [feedState, usersEntitySelector, posts, comments],
  (feedState, users, postMap, commentMap) => {
    const postIds = feedState.posts;

    return postIds.map(id => ({
      ...postMap[id],
      user: users[postMap[id].userPhoneNumber],
      comments: commentMap[id]
    }));
  }
);
