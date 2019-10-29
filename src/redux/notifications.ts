import PushNotification from "react-native-push-notification";
import { Platform, PlatformAndroidStatic } from "react-native";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

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

export function* notificationSagas() {
  yield all([]);
}

export enum ActionTypes {
  INITIALIZE = "notifications/INITIALIZE"
}

export const Actions = {
  initialize: (token: string) => createAction(ActionTypes.INITIALIZE, { token })
};

// PushNotification.configure({
//   // (optional) Called when Token is generated (iOS and Android)
//   onRegister: function(token) {
//     console.log("TOKEN:", token);
//   },

//   // (required) Called when a remote or local notification is opened or received
//   onNotification: function(notification) {
//     console.log("NOTIFICATION:", notification);

//     // process the notification

//     // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
//     notification.finish(PushNotificationIOS.FetchResult.NoData);
//   },

//   // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
//   senderID: "YOUR GCM (OR FCM) SENDER ID",

//   // IOS ONLY (optional): default: all - Permissions to register.
//   permissions: {
//     alert: true,
//     badge: true,
//     sound: true
//   },

//   // Should the initial notification be popped automatically
//   // default: true
//   popInitialNotification: true,

//   /**
//    * (optional) default: true
//    * - Specified if permissions (ios) and token (android and ios) will requested or not,
//    * - if not, you must call PushNotificationsHandler.requestPermissions() later
//    */
//   requestPermissions: true
// });
