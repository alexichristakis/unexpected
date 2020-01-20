import { Platform } from "react-native";
import {
  check,
  checkNotifications,
  NotificationsResponse,
  Permission,
  PERMISSIONS,
  PermissionStatus,
  request,
  requestNotifications
} from "react-native-permissions";
import { all, put, takeEvery, takeLatest } from "redux-saga/effects";

import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";
import { notificationWatcher } from "./app";

export interface PermissionsState {
  readonly loading: boolean;
  readonly notifications: NotificationsResponse;
  readonly camera: PermissionStatus;
  readonly location: PermissionStatus;
  readonly contacts: PermissionStatus;
  readonly error: string;
}

const initialState: PermissionsState = {
  loading: false,
  notifications: { status: "denied", settings: {} },
  camera: "denied",
  location: "denied",
  contacts: "denied",
  error: ""
};

interface PermissionType {
  key: string;
  ios: Permission;
  android: Permission;
}
export const Permissions = {
  CAMERA: {
    key: "camera",
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA
  },
  LOCATION: {
    key: "location",
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
  },
  CONTACTS: {
    key: "contacts",
    ios: PERMISSIONS.IOS.CONTACTS,
    android: PERMISSIONS.ANDROID.READ_CONTACTS
  }
};

export default (
  state: PermissionsState = initialState,
  action: ActionsUnion<typeof Actions>
): PermissionsState => {
  switch (action.type) {
    case ActionTypes.SET_NOTIFICATIONS: {
      const { res } = action.payload;

      return { ...state, notifications: res };
    }

    case ActionTypes.REQUEST_PERMISSION: {
      return { ...state, loading: true };
    }

    case ActionTypes.SET_PERMISSION: {
      const { status, type } = action.payload;

      return { ...state, [type.key]: status, loading: false };
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
    let {
      status,
      settings
    }: NotificationsResponse = yield checkNotifications();

    if (status !== "granted") {
      ({ status, settings } = yield requestNotifications(["alert", "badge"]));
    }

    yield put(Actions.setNotifications({ status, settings }));
  } catch (err) {
    yield put(Actions.errorRequestingPermissions(err));
  }
}

function* onRequestPermission(
  action: ExtractActionFromActionCreator<typeof Actions.requestPermission>
) {
  const { type } = action.payload;
  try {
    const permission = Platform.OS === "ios" ? type.ios : type.android;
    let status: PermissionStatus = yield check(permission);

    if (status === "denied") {
      status = yield request(permission);
    }

    yield put(Actions.setPermission(type, status));
  } catch (err) {
    yield put(Actions.errorRequestingPermissions(err));
  }
}

export function* permissionSagas() {
  yield all([
    yield takeLatest(ActionTypes.SET_NOTIFICATIONS, notificationWatcher),
    yield takeLatest(ActionTypes.REQUEST_NOTIFICATIONS, onRequestNotifications),
    yield takeEvery(ActionTypes.REQUEST_PERMISSION, onRequestPermission)
  ]);
}

export enum ActionTypes {
  REQUEST_NOTIFICATIONS = "permissions/REQUEST_NOTIFICATIONS",
  SET_NOTIFICATIONS = "permissions/SET_NOTIFICATIONS",
  REQUEST_PERMISSION = "permissions/REQUEST_PERMISSION",
  SET_PERMISSION = "permissions/SET_PERMISSION",
  ERROR_REQUESTING = "permissions/ERROR_REQUESTING"
}

export const Actions = {
  requestNotifications: () => createAction(ActionTypes.REQUEST_NOTIFICATIONS),
  setNotifications: (res: NotificationsResponse) =>
    createAction(ActionTypes.SET_NOTIFICATIONS, { res }),
  requestPermission: (type: PermissionType) =>
    createAction(ActionTypes.REQUEST_PERMISSION, { type }),
  setPermission: (type: PermissionType, status: PermissionStatus) =>
    createAction(ActionTypes.SET_PERMISSION, { type, status }),
  errorRequestingPermissions: (err: string) =>
    createAction(ActionTypes.ERROR_REQUESTING, { err })
};
