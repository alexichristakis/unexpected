import { createSelector } from "reselect";

import { getPostImageURL } from "@api";

import { RootState } from "../types";
import { post } from "./post";
import { users } from "./user";

const s = (state: RootState) => state.friend || {};

const idFromProps = (_: RootState, props: { id: string }) => props.id;

const f = createSelector(s, (state) => state.friends);

export const requests = createSelector(s, (state) => state.requests);
export const requested = createSelector(s, (state) => state.requested);

export const friends = createSelector([f, idFromProps], (friends, id) => {
  console.log(friends, id);
  return friends[id] ?? [];
});
