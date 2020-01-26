import { RootState } from "../types";
import { currentUser, phoneNumber } from "./user";

const s = (state: RootState) => state.auth || {};

export const jwt = (state: RootState) => s(state).jwt;

export const authPhoneNumber = (state: RootState) => s(state).phoneNumber;

export const isAuthorized = (state: RootState) =>
  !!s(state).jwt && !!phoneNumber(state);
