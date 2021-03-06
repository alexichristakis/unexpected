import { createSelector } from "reselect";

import { getPostImageURL } from "@api";

import { RootState } from "../types";
import { post } from "./post";
import { users } from "./user";

const s = (state: RootState) => state.comment || {};

const idFromProps = (_: RootState, props: { id?: string; postId?: string }) =>
  props.id ?? props.postId;

const comments = createSelector(s, (state) => state.comments);

export const commentsForPost = createSelector(
  [comments, idFromProps],
  (comments, id) => {
    const postComments = comments[id ?? ""] ?? {};

    return Object.values(postComments);
  }
);

export const numComments = createSelector(commentsForPost, (comments) => {
  return comments.length;
});

export const sendingComment = createSelector(s, (state) => state.loading);
