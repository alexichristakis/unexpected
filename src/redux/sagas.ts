import { all, fork } from "redux-saga/effects";

import { authSagas } from "./auth";
import { userSagas } from "./user";
import { permissionSagas } from "./permissions";

export default function* rootSaga() {
  yield all([yield fork(authSagas), yield fork(userSagas), yield fork(permissionSagas)]);
}
