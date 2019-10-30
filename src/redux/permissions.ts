import PushNotification from "react-native-push-notification";
import {
  check,
  request,
  PERMISSIONS,
  checkNotifications,
  requestNotifications,
  NotificationsResponse,
  NotificationSettings
} from "react-native-permissions";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import { ActionsUnion, createAction } from "./utils";
import { REHYDRATE } from "redux-persist";

export interface PermissionsState {
  readonly notifications: NotificationsResponse;
  readonly location: boolean;
  readonly contacts: boolean;
  readonly error: string;
}

const initialState: PermissionsState = {
  notifications: { status: "unavailable", settings: {} },
  location: false,
  contacts: false,
  error: ""
};

export type PermissionsActionTypes = ActionsUnion<typeof Actions>;
export default (state: PermissionsState = initialState, action: PermissionsActionTypes) => {
  switch (action.type) {
    case ActionTypes.SET_NOTIFICATIONS: {
      const { res } = action.payload;
      return { ...state, notifications: res };
    }

    case ActionTypes.REQUEST_LOCATION: {
      return { ...state };
    }

    case ActionTypes.ERROR_REQUESTING: {
      return { ...state, error: action.payload.err };
    }

    default:
      return state;
  }
};

function* onStartup() {
  try {
    const { status, settings }: NotificationsResponse = yield checkNotifications();
    if (status === "granted") {
      yield put(Actions.setNotifications({ status, settings }));
    }
  } catch (err) {
    yield put(Actions.errorRequestingPermissions(err));
  }
}

function* onRequestNotifications() {
  try {
    const { status, settings }: NotificationsResponse = yield checkNotifications();
    if (status === "granted") {
      yield put(Actions.setNotifications({ status, settings }));
    }

    if (status !== "granted") {
      const { status, settings }: NotificationsResponse = yield requestNotifications([
        "alert",
        "badge"
      ]);
    }
  } catch (err) {
    yield put(Actions.errorRequestingPermissions(err));
  }
}

export function* permissionSagas() {
  yield all([
    yield takeLatest(REHYDRATE, onStartup),
    yield takeLatest(ActionTypes.REQUEST_NOTIFICATIONS, onRequestNotifications)
  ]);
}

export enum ActionTypes {
  REQUEST_NOTIFICATIONS = "permissions/REQUEST_NOTIFICATIONS",
  SET_NOTIFICATIONS = "permissions/SET_NOTIFICATIONS",
  REQUEST_LOCATION = "permissions/REQUEST_LOCATION",
  SET_LOCATION = "permissions/SET_LOCATION",
  ERROR_REQUESTING = "permissions/ERROR_REQUESTING"
}

export const Actions = {
  requestNotifications: () => createAction(ActionTypes.REQUEST_NOTIFICATIONS),
  setNotifications: (res: NotificationsResponse) =>
    createAction(ActionTypes.SET_NOTIFICATIONS, { res }),
  requestLocation: () => createAction(ActionTypes.REQUEST_LOCATION),
  errorRequestingPermissions: (err: string) => createAction(ActionTypes.ERROR_REQUESTING, { err })
};
