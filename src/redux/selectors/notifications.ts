import { AppState } from "../types";

const s = (state: AppState) => state.notifications || {};

export const deviceToken = (state: AppState) => s(state).deviceToken;
