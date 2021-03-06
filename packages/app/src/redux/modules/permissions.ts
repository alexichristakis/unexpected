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
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";

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
  error: "",
};

export type PermissionType = {
  key: string;
  ios: Permission;
  android: Permission;
};
export const Permissions = {
  CAMERA: {
    key: "camera",
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  },
  LOCATION: {
    key: "location",
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  },
  CONTACTS: {
    key: "contacts",
    ios: PERMISSIONS.IOS.CONTACTS,
    android: PERMISSIONS.ANDROID.READ_CONTACTS,
  },
};

export default (
  state: PermissionsState = initialState,
  action: ActionUnion
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
      settings,
    }: NotificationsResponse = yield checkNotifications();

    if (status !== "granted") {
      Notifications.registerRemoteNotifications();

      ({ status, settings } = yield checkNotifications());
      // ({ status, settings } = yield requestNotifications([
      //   "alert",
      //   "badge"
      // ]));
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
    yield takeLatest(ActionTypes.REQUEST_NOTIFICATIONS, onRequestNotifications),
    yield takeEvery(ActionTypes.REQUEST_PERMISSION, onRequestPermission),
  ]);
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
    createAction(ActionTypes.ERROR_REQUESTING, { err }),
};
