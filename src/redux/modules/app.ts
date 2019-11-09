import { AppState as AppStatus, AppStateStatus as AppStatusType, StatusBar } from "react-native";
import NetInfo, { NetInfoState, NetInfoStateType } from "@react-native-community/netinfo";
import PushNotifications, { PushNotification } from "react-native-push-notification";
import moment, { Moment } from "moment";
import { REHYDRATE } from "redux-persist";
import { eventChannel } from "redux-saga";
import { all, call, fork, put, select, take, takeLatest, takeEvery } from "redux-saga/effects";

import Navigation, { NavigationEmitterPayload } from "../../Navigation";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";
import { ActionTypes as PermissionsActionTypes } from "./permissions";
import { Actions as UserActions } from "./user";

export interface AppState {
  appStatus: AppStatusType;
  networkStatus: NetInfoState;
  currentRoute: string;
  camera: {
    enabled: boolean;
    timeOfExpiry?: Moment;
  };
}

const initialState: AppState = {
  appStatus: "active",
  networkStatus: {
    type: NetInfoStateType.unknown,
    isConnected: false,
    isInternetReachable: false,
    details: null
  },
  currentRoute: "",
  camera: {
    enabled: false,
    timeOfExpiry: undefined
  }
};

export type AppActionTypes = ActionsUnion<typeof Actions>;
export default (state: AppState = initialState, action: AppActionTypes) => {
  switch (action.type) {
    case ActionTypes.NAVIGATE: {
      const { route } = action.payload;
      Navigation.navigate(route);
      return { ...state, currentRoute: route };
    }

    case ActionTypes.ENABLE_CAMERA: {
      return { ...state, camera: { enabled: true, timeOfExpiry: new Date() } };
    }

    case ActionTypes.SET_CAMERA_TIMER: {
      const { time } = action.payload;
      return { ...state, camera: { enabled: true, timeOfExpiry: time } };
    }

    case ActionTypes.EXPIRE_CAMERA: {
      return { ...state, camera: { enabled: false, timeOfExpiry: undefined } };
    }

    case ActionTypes.SET_APP_STATUS: {
      const { status } = action.payload;
      return { ...state, appStatus: status };
    }

    case ActionTypes.SET_NET_INFO: {
      const { netInfo } = action.payload;
      return { ...state, networkStatus: netInfo };
    }

    default:
      return state;
  }
};

// function* onNavigate({ payload }: ExtractActionFromActionCreator<typeof Actions.updateNavigation>) {
//   const { prevState, nextState, action } = payload;

//   if (action.type === "Navigation/BACK" || action.type === "Navigation/JUMP_TO") {
//   }
// }

function* onReceiveNotification(
  action: ExtractActionFromActionCreator<typeof Actions.processNotification>
) {
  const { notification } = action.payload;
  const { data }: { data: any } = notification;

  // notification is to start the photo clock
  if (data.photoTime) {
    const { time }: { time: Date } = data;

    const expiry = moment(time).add("10 minutes");

    yield put(Actions.setCameraTimer(expiry));
  }
}

const appEmitter = () => {
  return eventChannel(emit => {
    const appStatusHandler = (state: AppStatusType) => emit({ appStatus: state });
    const netInfoHandler = (state: NetInfoState) => emit({ netInfo: state });
    // const navigationHandler = (state: NavigationEmitterPayload) => emit({ navigation: state });

    // Navigation.navigationEmitter.on("state-change", navigationHandler);
    AppStatus.addEventListener("change", appStatusHandler);
    const unsubscribe = NetInfo.addEventListener(netInfoHandler);

    return () => {
      unsubscribe();
      // Navigation.navigationEmitter.removeAllListeners();
      AppStatus.removeEventListener("change", appStatusHandler);
    };
  });
};

function* onStartup() {
  const appChannel = yield call(appEmitter);

  while (true) {
    const {
      appStatus,
      netInfo
    }: // navigation
    {
      appStatus: AppStatusType;
      netInfo: NetInfoState;
      // navigation: NavigationEmitterPayload;
    } = yield take(appChannel);

    if (appStatus) {
      yield put(Actions.setAppStatus(appStatus));
    }

    if (netInfo) {
      yield put(Actions.setNetInfo(netInfo));
    }

    // if (navigation) {
    //   // console.log(navigation);
    //   const { action } = navigation;

    //   if (action.type === "Navigation/NAVIGATE") {
    //     if (action.routeName === "Capture") StatusBar.setBarStyle("light-content");
    //   }

    //   if (action.type === "Navigation/POP") {
    //     StatusBar.setBarStyle("dark-content");
    //   }

    //   // yield put(Actions.updateNavigation(navigation));
    // }
  }
}

const notificationEmitter = () => {
  return eventChannel(emit => {
    PushNotifications.configure({
      onRegister: token => emit({ token }),
      onNotification: notification => emit({ notification }),
      senderID: "YOUR GCM (OR FCM) SENDER ID",
      requestPermissions: false
    });

    return () => {};
  });
};

function* onRegisterNotifications() {
  const tokenChannel = yield call(notificationEmitter);

  while (true) {
    const { token, notification } = yield take(tokenChannel);

    if (token) {
      yield put(UserActions.updateUser({ deviceToken: token.token, deviceOS: token.os }));
    }

    if (notification) {
      yield put(Actions.processNotification(notification));
    }
  }
}

export function* appSagas() {
  yield all([
    yield takeEvery(REHYDRATE, onStartup),
    // yield takeEvery(ActionTypes.UPDATE_NAVIGATION, onNavigate),
    yield takeEvery(ActionTypes.PROCESS_NOTIFICATION, onReceiveNotification),
    yield takeLatest(PermissionsActionTypes.SET_NOTIFICATIONS, onRegisterNotifications)
  ]);
}

export enum ActionTypes {
  UPDATE_NAVIGATION = "app/UPDATE_NAVIGATION",
  NAVIGATE = "app/NAVIGATE",
  PROCESS_NOTIFICATION = "app/PROCESS_NOTIFICATION",
  SET_CAMERA_TIMER = "app/SET_CAMERA_TIMER",
  ENABLE_CAMERA = "app/ENABLE_CAMERA",
  EXPIRE_CAMERA = "app/EXPIRE_CAMERA",
  SET_APP_STATUS = "app/SET_APP_STATUS",
  SET_NET_INFO = "app/SET_NET_INFO"
}

export const Actions = {
  // updateNavigation: (payload: NavigationEmitterPayload) =>
  //   createAction(ActionTypes.UPDATE_NAVIGATION, { ...payload }),
  navigate: (route: string, props?: any) => createAction(ActionTypes.NAVIGATE, { route, props }),
  processNotification: (notification: PushNotification) =>
    createAction(ActionTypes.PROCESS_NOTIFICATION, { notification }),
  setCameraTimer: (time: Moment) => createAction(ActionTypes.SET_CAMERA_TIMER, { time }),
  expireCamera: () => createAction(ActionTypes.EXPIRE_CAMERA),
  setAppStatus: (status: AppStatusType) => createAction(ActionTypes.SET_APP_STATUS, { status }),
  setNetInfo: (netInfo: NetInfoState) => createAction(ActionTypes.SET_NET_INFO, { netInfo })
};
