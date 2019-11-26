import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.user;

export const userLoading = createSelector(s, state => state.loading);

export const users = createSelector(s, state => state.users);

export const phoneNumber = createSelector(s, state => state.phoneNumber);

export const user = createSelector(
  [users, phoneNumber],
  (users, phoneNumber) => users[phoneNumber]
);

export const deviceToken = createSelector(user, user => user.deviceToken);
