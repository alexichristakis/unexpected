import { combineReducers } from "redux";

import app from "./modules/app";
import auth from "./modules/auth";
import user from "./modules/user";
import permissions from "./modules/permissions";
import image from "./modules/image";
import post from "./modules/post";

export default combineReducers({ app, auth, user, permissions, image, post });
