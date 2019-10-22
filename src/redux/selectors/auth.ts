import { AppState } from "../types";

const s = (state: AppState) => state.auth || {};

export const jwt = (state: AppState) => s(state).jwt;

export const isAuthorized = (state: AppState) => !!s(state).jwt;
