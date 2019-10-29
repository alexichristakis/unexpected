import { all, fork } from "redux-saga/effects";

import { authSagas } from "./auth";
import { userSagas } from "./user";
import { notificationSagas } from "./notifications";

export default function* rootSaga() {
  yield all([yield fork(authSagas), yield fork(userSagas), yield fork(notificationSagas)]);
}
