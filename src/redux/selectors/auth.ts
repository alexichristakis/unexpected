import { AppState } from "../types";

const s = (state: AppState) => state.auth || {};

export const jwt = (state: AppState) => s(state).jwt;

export const phoneNumber = (state: AppState) => s(state).phoneNumber;

export const isAuthorized = (state: AppState) => !!s(state).jwt && s(state).authFlowCompleted;
