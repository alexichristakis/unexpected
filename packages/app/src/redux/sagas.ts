import { all, fork } from "redux-saga/effects";

import {
  appSagas,
  authSagas,
  imageSagas,
  permissionSagas,
  postSagas,
  userSagas,
  friendSagas,
  commentSagas,
} from "./modules";

export default function* rootSaga() {
  yield all([
    yield fork(authSagas),
    yield fork(userSagas),
    yield fork(permissionSagas),
    yield fork(appSagas),
    yield fork(imageSagas),
    yield fork(postSagas),
    yield fork(friendSagas),
    yield fork(commentSagas),
  ]);
}
