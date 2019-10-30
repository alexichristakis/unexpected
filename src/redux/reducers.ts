import { combineReducers } from "redux";

import auth from "./modules/auth";
import user from "./modules/user";
import permissions from "./modules/permissions";

export default combineReducers({ auth, user, permissions });
