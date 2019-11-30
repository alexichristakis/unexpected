import AsyncStorage from "@react-native-community/async-storage";
import { combineReducers } from "redux";

import app from "./modules/app";
import auth, { ActionTypes as AuthActionTypes } from "./modules/auth";
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
  if (action.type === AuthActionTypes.LOGOUT) {
    setTimeout(() => {
      AsyncStorage.clear();
    }, 200);
  }

  return appReducers(state, action);
};
