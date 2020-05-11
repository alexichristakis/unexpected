import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.user;

export const users = createSelector(s, (state) => state.users);

export const userError = createSelector(s, (state) => state.error);

export const userLoading = createSelector(s, (state) => state.loading);

export const userRequestsLoading = createSelector(
  s,
  (state) => state.loadingRequests
);

export const phoneNumber = createSelector(s, (state) => state.phoneNumber);

export const userId = createSelector(s, (state) => state.id);

const idFromProps = (_: RootState, props: { id: string }) => props.id;

export const user = createSelector([users, idFromProps], (users, id) => {
  return users[id] ?? {};
});

export const currentUser = createSelector(
  [users, phoneNumber],
  (users, phoneNumber) => users[phoneNumber]
);

export const userStale = createSelector(s, (state) => state.stale);

export const deviceToken = createSelector(
  currentUser,
  (currentUserEntity) => currentUserEntity.deviceToken
);
