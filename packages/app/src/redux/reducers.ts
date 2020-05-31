import { combineReducers } from "redux";

import {
  AppReducer,
  AuthReducer,
  CommentReducer,
  FriendReducer,
  ImageReducer,
  PermissionsReducer,
  PostReducer,
  UserReducer,
  SearchReducer,
} from "./modules";
import { RootState } from "./types";

const appReducers = combineReducers({
  app: AppReducer,
  auth: AuthReducer,
  image: ImageReducer,
  permissions: PermissionsReducer,
  post: PostReducer,
  user: UserReducer,
  comment: CommentReducer,
  friend: FriendReducer,
  search: SearchReducer,
});

export const root = (state?: RootState, action?: any) => {
  return appReducers(state, action);
};
