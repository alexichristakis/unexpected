import { combineReducers } from "redux";

import app from "./modules/app";
import auth from "./modules/auth";
import image from "./modules/image";
import permissions from "./modules/permissions";
import post from "./modules/post";
import user from "./modules/user";
import { RootState } from "./types";

const appReducers = combineReducers({
  app,
  auth,
  user,
  permissions,
  image,
  post
});

export const root = (state?: RootState, action?: any) => {
  return appReducers(state, action);
};
