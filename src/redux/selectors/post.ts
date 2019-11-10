import { RootState } from "../types";

const s = (state: RootState) => state.post || {};

export const isSendingPost = (state: RootState) => s(state).loading;

export const errorSendingPost = (state: RootState) => s(state).error;

export const usersPosts = (state: RootState) => s(state).user.posts;

export const usersPostsStale = (state: RootState) => s(state).user.stale;

export const feedState = (state: RootState) => s(state).feed;
