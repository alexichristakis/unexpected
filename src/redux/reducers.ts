import { combineReducers } from "redux";

import auth from "./modules/auth";
import user from "./modules/user";
import permissions from "./modules/permissions";
import image from "./modules/image";

export default combineReducers({ auth, user, permissions, image });
