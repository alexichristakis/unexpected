import { combineReducers } from "redux";

import {
  AppReducer,
  AuthReducer,
  ImageReducer,
  PermissionsReducer,
  PostReducer,
  UserReducer
} from "./modules";
import { RootState } from "./types";

const appReducers = combineReducers({
  app: AppReducer,
  auth: AuthReducer,
  image: ImageReducer,
  permissions: PermissionsReducer,
  post: PostReducer,
  user: UserReducer
});

export const root = (state?: RootState, action?: any) => {
  return appReducers(state, action);
};
