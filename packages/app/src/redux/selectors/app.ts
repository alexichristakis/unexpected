import { RootState } from "../types";

const s = (state: RootState) => state.app || {};

export const networkInfo = (state: RootState) => s(state).networkStatus;

export const isConnected = (state: RootState) => networkInfo(state).isConnected;

export const isInternetReachable = (state: RootState) =>
  !!networkInfo(state).isInternetReachable;

export const isBackendReachable = (state: RootState) =>
  networkInfo(state).isBackendReachable;

export const camera = (state: RootState) => s(state).camera;
