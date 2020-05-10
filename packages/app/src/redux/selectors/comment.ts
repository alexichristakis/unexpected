import { createSelector } from "reselect";

import { getPostImageURL } from "@api";

import { users } from "./user";
import { post } from "./post";
import { RootState } from "../types";

const s = (state: RootState) => state.comment || {};

const idFromProps = (_: RootState, props: { id: string }) => props.id;

const comments = createSelector(s, (state) => state.comments);

export const numComments = createSelector(
  [comments, idFromProps],
  (comments, id) => {
    const postComments = comments[id] ?? {};

    return Object.keys(postComments).length;
  }
);
