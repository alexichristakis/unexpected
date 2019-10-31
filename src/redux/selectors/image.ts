import { AppState } from "../types";

const s = (state: AppState) => state.image || {};

export const currentImage = (state: AppState) => s(state).currentImage;
