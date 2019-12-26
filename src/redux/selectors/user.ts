import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.user;

export const userLoading = createSelector(s, state => state.loading);

export const users = createSelector(s, state => state.users);

export const phoneNumber = createSelector(s, state => state.phoneNumber);

const phoneNumberFromProps = (_: RootState, props: { phoneNumber: string }) =>
  props.phoneNumber;
export const user = createSelector(
  [users, phoneNumberFromProps],
  (users, phoneNumber) => users[phoneNumber]
);

export const currentUser = createSelector(
  [users, phoneNumber],
  (users, phoneNumber) => users[phoneNumber]
);

export const deviceToken = createSelector(
  currentUser,
  currentUserEntity => currentUserEntity.deviceToken
);
