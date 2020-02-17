import { createSelector } from "reselect";
import moment from "moment";

import { RootState } from "../types";
import {
  phoneNumber as phoneNumberSelector,
  user as userEntitySelector,
  users as usersEntitySelector
} from "./user";

const s = (state: RootState) => state.post || {};
const usersSelector = createSelector(s, state => state.users);

const _posts = (state: RootState) => s(state).posts;
const _comments = (state: RootState) => s(state).comments;

export const commentsLoading = (state: RootState) => s(state).commentsLoading;
export const postLoading = (state: RootState) => s(state).loading;
export const feedLoading = (state: RootState) => s(state).feed.loading;

export const errorSendingPost = (state: RootState) => s(state).error;

const phoneNumberFromProps = (_: RootState, props: { phoneNumber: string }) =>
  props.phoneNumber;

const postIdFromProps = (_: RootState, props: { postId: string }) =>
  props.postId;

export const commentsForPost = createSelector(
  [_comments, postIdFromProps],
  (commentMap, postId) => commentMap[postId] || []
);

export const post = createSelector(
  [_posts, _comments, usersEntitySelector, postIdFromProps],
  (posts, commentMap, users, id) => {
    const post = posts[id] ?? {};

    const comments = commentMap[id] ?? [];
    const user = users[post.phoneNumber] ?? {};

    return {
      id, // in case post is undefined
      ...post,
      comments,
      user
    };
  }
);

export const usersPosts = createSelector(
  [usersSelector, _posts, userEntitySelector],
  (users, posts, user) => {
    const phoneNumber = user.phoneNumber;
    const postIds = users[phoneNumber]?.posts ?? [];

    return postIds.map(id => posts[id]);
  }
);

export const usersPostsLength = createSelector(
  [usersSelector, userEntitySelector],
  (users, { phoneNumber }) => {
    const postIds = users[phoneNumber]?.posts ?? [];

    return postIds.length;
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
  [currentUsersPostsState, _posts],
  (userPostState, posts) => {
    const postIds = userPostState.posts ?? [];

    return postIds.map(id => posts[id]);
  }
);

export const feedState = (state: RootState) => s(state).feed;

export const feedStale = createSelector([feedState], state => state.stale);

export const feed = createSelector(
  [feedState, _posts],
  (feedState, postMap) => {
    const postIds = feedState.posts;

    return postIds.map(id => postMap[id]);
  }
);
