import { RootState } from "../types";

const s = (state: RootState) => state.permissions || {};

export const permissions = (state: RootState) => s(state);

export const cameraPermissions = (state: RootState) => s(state).camera;
