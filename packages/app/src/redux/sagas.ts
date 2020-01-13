import { all, fork } from "redux-saga/effects";

import { appSagas } from "./modules/app";
import { authSagas } from "./modules/auth";
import { imageSagas } from "./modules/image";
import { permissionSagas } from "./modules/permissions";
import { postSagas } from "./modules/post";
import { userSagas } from "./modules/user";

export default function* rootSaga() {
  yield all([
    yield fork(authSagas),
    yield fork(userSagas),
    yield fork(permissionSagas),
    yield fork(appSagas),
    yield fork(imageSagas),
    yield fork(postSagas)
  ]);
}