import { createSelector } from "reselect";

import { RootState } from "../types";
import {
  phoneNumber as phoneNumberSelector,
  user as userEntitySelector,
  users as usersEntitySelector
} from "./user";

const s = (state: RootState) => state.post || {};
const usersSelector = createSelector(s, state => state.users);

const posts = (state: RootState) => s(state).posts;
const comments = (state: RootState) => s(state).comments;

export const commentsLoading = (state: RootState) => s(state).commentsLoading;
export const postLoading = (state: RootState) => s(state).loading;
export const feedLoading = (state: RootState) => s(state).feed.loading;

export const errorSendingPost = (state: RootState) => s(state).error;

const phoneNumberFromProps = (_: RootState, props: { phoneNumber: string }) =>
  props.phoneNumber;

const postIdFromProps = (_: RootState, props: { postId: string }) =>
  props.postId;

export const post = createSelector(
  [posts, comments, usersEntitySelector, postIdFromProps],
  (posts, commentMap, users, id) => {
    const post = posts[id];

    return {
      ...post,
      comments: commentMap[id],
      user: users[post.userPhoneNumber]
    };
  }
);

export const usersPosts = createSelector(
  [usersSelector, posts, userEntitySelector],
  (users, posts, user) => {
    const phoneNumber = user.phoneNumber;
    const postIds = users[phoneNumber].posts ?? [];

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

export const currentUsersPosts = createSelector(
  [currentUsersPostsState, posts],
  (userPostState, posts) => {
    const postIds = userPostState.posts;

    return postIds.map(id => posts[id]);
  }
);

export const feedState = (state: RootState) => s(state).feed;

export const feedStale = createSelector([feedState], state => state.stale);

export const feed = createSelector([feedState, posts], (feedState, postMap) => {
  const postIds = feedState.posts;

  return postIds.map(id => postMap[id]);
});
