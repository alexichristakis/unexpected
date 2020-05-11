import { RootState } from "../types";
import { currentUser, phoneNumber } from "./user";
import { createSelector } from "reselect";

const s = (state: RootState) => state.auth || {};

export const jwt = (state: RootState) => s(state).jwt;

export const authPhoneNumber = createSelector(s, (state) => state.phone);

export const isNewAccount = createSelector(s, (state) => state.isNewAccount);

export const isAuthorized = (state: RootState) =>
  !!s(state).jwt && !!phoneNumber(state);
