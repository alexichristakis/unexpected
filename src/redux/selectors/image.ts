import { RootState } from "../types";

const s = (state: RootState) => state.image || {};

export const currentImage = (state: RootState) => s(state).currentImage;
