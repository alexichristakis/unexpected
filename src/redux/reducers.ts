import { combineReducers } from "redux";

import auth from "./auth";
import user from "./user";
import permissions from "./permissions";

export default combineReducers({ auth, user, permissions });
