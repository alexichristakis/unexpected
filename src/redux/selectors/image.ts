import { RootState } from "../types";

const s = (state: RootState) => state.image || {};

export const currentImage = (state: RootState) => s(state).currentImage;

export const isUploadingImage = (state: RootState) => s(state).uploading;

export const profilePhotoCache = (state: RootState) => s(state).cache.profile;

export const feedPhotoCache = (state: RootState) => s(state).cache.feed;

export const feedPhotoCacheForUser = (state: RootState, phoneNumber: string) =>
  s(state).cache.feed[phoneNumber] || {};
