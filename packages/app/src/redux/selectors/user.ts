import { createSelector } from "reselect";

import { User } from "@unexpected/global";
import { RootState } from "../types";

const s = (state: RootState) => state.user;

export const userError = createSelector(s, state => state.error);

export const userLoading = createSelector(s, state => state.loading);

export const users = createSelector(s, state => state.users);

export const phoneNumber = createSelector(s, state => state.phoneNumber);

const phoneNumberFromProps = (_: RootState, props: { user: User }) =>
  props.user.phoneNumber;
const userEntityFromProps = (_: RootState, props: { user: User }) => props.user;
export const user = createSelector(
  [users, phoneNumberFromProps, userEntityFromProps],
  (users, phoneNumber, fallback) =>
    !!users[phoneNumber] ? users[phoneNumber] : fallback
);

export const currentUser = createSelector(
  [users, phoneNumber],
  (users, phoneNumber) => users[phoneNumber]
);

export const deviceToken = createSelector(
  currentUser,
  currentUserEntity => currentUserEntity.deviceToken
);
