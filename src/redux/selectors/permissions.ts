import { AppState } from "../types";

const s = (state: AppState) => state.permissions || {};

export const cameraPermissions = (state: AppState) => s(state).camera;
