import { combineReducers } from "redux";

import auth from "./auth";
import user from "./user";
import notifications from "./notifications";
import permissions from "./permissions";

export default combineReducers({ auth, user, notifications, permissions });
