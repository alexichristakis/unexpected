import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.permissions || {};

export const notificationPermission = (state: RootState) =>
  s(state).notifications.status === "granted";

export const permissions = (state: RootState) => s(state);

const no = (status: string) => status === "denied";
export const shouldLaunchPermissions = createSelector(
  s,
  state => no(state.camera) || no(state.notifications.status)
);

export const cameraPermissions = (state: RootState) => s(state).camera;
