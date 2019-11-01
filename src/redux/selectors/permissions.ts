import { RootState } from "../types";

const s = (state: RootState) => state.permissions || {};

export const cameraPermissions = (state: RootState) => s(state).camera;
