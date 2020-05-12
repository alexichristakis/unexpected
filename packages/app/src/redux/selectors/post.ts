import { createSelector } from "reselect";

import { getPostImageURL, getHeaders } from "@api";

import { users } from "./user";
import { RootState } from "../types";
import { jwt } from "./auth";

const s = (state: RootState) => state.post || {};

const idFromProps = (_: RootState, props: { id: string }) => props.id;

export const posts = createSelector([s], (state) => state.posts);

export const populatedPost = createSelector(
  [posts, users, idFromProps],
  (posts, users, id) => {
    const post = posts[id] ?? {};

    const { user } = post;

    return {
      ...post,
      userId: user,
      user: users[user] ?? {},
    };
  }
);

export const post = createSelector([posts, idFromProps], (posts, id) => {
  const post = posts[id] ?? {};

  return post;
});

export const postImageURL = createSelector([post, jwt], (post, jwt) => {
  const { user, id } = post;

  return { uri: getPostImageURL(user, id), headers: getHeaders({ jwt }) };
});

export const usersPosts = createSelector(
  [posts, (_: RootState, props: { userId: string }) => props.userId],
  (postMap, userId) => {
    const posts = Object.values(postMap).filter(({ user }) => user === userId);

    return posts.map(({ id, createdAt }) => ({ id, createdAt }));
  }
);

export const feed = createSelector(s, (state) => Object.keys(state.posts));

export const isLoadingFeed = createSelector(s, (state) => state.loadingFeed);

export const isLoadingPost = createSelector(s, (state) => state.loadingPost);

export const isLoadingUsersPosts = createSelector(
  s,
  (state) => state.loadingUsersPosts
);
