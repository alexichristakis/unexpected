import { all, fork } from "redux-saga/effects";

import { appSagas } from "./modules/app";
import { authSagas } from "./modules/auth";
import { userSagas } from "./modules/user";
import { permissionSagas } from "./modules/permissions";

export default function* rootSaga() {
  yield all([
    yield fork(authSagas),
    yield fork(userSagas),
    yield fork(permissionSagas),
    yield fork(appSagas)
  ]);
}
