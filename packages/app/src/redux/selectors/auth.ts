import { createSelector } from "reselect";
import { RootState } from "../types";
import { currentUser } from "./user";

const s = (state: RootState) => state.auth || {};

export const jwt = (state: RootState) => s(state).jwt;

export const authPhoneNumber = createSelector(s, (state) => state.phone);

export const isNewAccount = createSelector(s, (state) => state.isNewAccount);

export const isAuthorized = createSelector([jwt, currentUser], (jwt, user) => {
  return !!jwt && !!user.id;
});
