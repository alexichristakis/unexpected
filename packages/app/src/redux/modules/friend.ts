import { Platform } from "react-native";
import { Notifications } from "react-native-notifications";
import {
  check,
  checkNotifications,
  NotificationsResponse,
  Permission,
  PERMISSIONS,
  PermissionStatus,
  request,
  requestNotifications,
} from "react-native-permissions";
import { all, put, takeEvery, takeLatest } from "redux-saga/effects";

import {
  ActionUnion,
  ActionTypes,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";

export interface FriendState {
  readonly loading: boolean;
}

const initialState: FriendState = {
  loading: false,
};

export default (
  state: FriendState = initialState,
  action: ActionUnion
): FriendState => {
  switch (action.type) {
    case ActionTypes.SET_NOTIFICATIONS: {
    }

    default:
      return state;
  }
};

export function* friendSagas() {
  yield all([
    // yield takeLatest(),
  ]);
}

export const Actions = {};
