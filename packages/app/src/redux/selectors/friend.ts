import { createSelector } from "reselect";

import { getPostImageURL } from "@api";

import { users } from "./user";
import { post } from "./post";
import { RootState } from "../types";

const s = (state: RootState) => state.friend || {};

const idFromProps = (_: RootState, props: { id: string }) => props.id;

const f = createSelector(s, (state) => state.friends);

export const requests = createSelector(s, (state) => state.requests);
export const requested = createSelector(s, (state) => state.requested);

export const friends = createSelector([f, idFromProps], (friends, id) => {
  return friends[id] ?? [];
});
