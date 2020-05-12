import { createSelector } from "reselect";

import { getPostImageURL } from "@api";

import { users } from "./user";
import { RootState } from "../types";

const s = (state: RootState) => state.post || {};

const idFromProps = (_: RootState, props: { id: string }) => props.id;

export const posts = createSelector([s], (state) => state.posts);

export const post = createSelector(
  [posts, users, idFromProps],
  (posts, users, id) => {
    const post = posts[id] ?? {};

    const { user } = post;

    return {
      ...post,
      user: users[user] ?? {},
    };
  }
);

export const postImageURL = createSelector([post], (post) => {
  const { user, photoId } = post;

  return getPostImageURL(user.id, photoId);
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
