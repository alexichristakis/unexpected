import PushNotification from "react-native-push-notification";
// import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform, PlatformAndroidStatic } from "react-native";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import { ActionTypes as PermissionsActionTypes } from "./permissions";
import { ActionsUnion, createAction } from "./utils";

export interface NotificationState {
  readonly deviceToken: string;
  readonly os: typeof Platform.OS | null;
}

const intialState: NotificationState = {
  deviceToken: "",
  os: null
};

export type NotificationActionTypes = ActionsUnion<typeof Actions>;
export default (state: NotificationState = intialState, action: NotificationActionTypes) => {
  switch (action.type) {
    case ActionTypes.INITIALIZE: {
      return { ...state, deviceToken: action.payload.token, os: Platform.OS };
    }

    default:
      return state;
  }
};

function* setToken({ token }: { token: string }) {
  yield put(Actions.initialize(token));
}

function* onRegisterNotifications() {
  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: setToken,

    // (required) Called when a remote or local notification is opened or received
    onNotification: notification => {
      console.log("NOTIFICATION:", notification);

      // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
      // notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
    senderID: "YOUR GCM (OR FCM) SENDER ID",

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true
    },

    popInitialNotification: true,

    requestPermissions: false
  });
}

export function* notificationSagas() {
  yield all([yield takeLatest(PermissionsActionTypes.SET_NOTIFICATIONS, onRegisterNotifications)]);
}

export enum ActionTypes {
  INITIALIZE = "notifications/INITIALIZE"
}

export const Actions = {
  initialize: (token: string) => createAction(ActionTypes.INITIALIZE, { token })
};
