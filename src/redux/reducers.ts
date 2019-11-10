import { combineReducers } from "redux";

import app from "./modules/app";
import auth from "./modules/auth";
import image from "./modules/image";
import permissions from "./modules/permissions";
import post from "./modules/post";
import user from "./modules/user";

export default combineReducers({ app, auth, user, permissions, image, post });
