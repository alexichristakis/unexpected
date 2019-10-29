import PushNotification from "react-native-push-notification";
import {
  check,
  request,
  PERMISSIONS,
  checkNotifications,
  requestNotifications,
  NotificationsResponse
} from "react-native-permissions";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import { ActionsUnion, createAction } from "./utils";

export interface PermissionsState {
  readonly notifications: boolean;
  readonly location: boolean;
  readonly contacts: boolean;
  readonly error: string;
}

const initialState: PermissionsState = {
  notifications: false,
  location: false,
  contacts: false,
  error: ""
};

export type PermissionsActionTypes = ActionsUnion<typeof Actions>;
export default (state: PermissionsState = initialState, action: PermissionsActionTypes) => {
  switch (action.type) {
    case ActionTypes.SET_NOTIFICATIONS: {
      return { ...state, notifications: true };
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

function* onRequestNotifications() {
  try {
    const { status, settings }: NotificationsResponse = yield checkNotifications();

    if (status !== "granted") {
      const { status, settings }: NotificationsResponse = yield requestNotifications([
        "alert",
        "badge"
      ]);

      console.log(status);

      if (status === "granted") {
        yield put(Actions.setNotifications());
      }
    }
  } catch (err) {
    yield put(Actions.errorRequestingPermissions(err));
  }
}

export function* permissionSagas() {
  yield all([yield takeLatest(ActionTypes.REQUEST_NOTIFICATIONS, onRequestNotifications)]);
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
  setNotifications: () => createAction(ActionTypes.SET_NOTIFICATIONS),
  requestLocation: () => createAction(ActionTypes.REQUEST_LOCATION),
  errorRequestingPermissions: (err: string) => createAction(ActionTypes.ERROR_REQUESTING, { err })
};
