import NetInfo, {
  NetInfoState,
  NetInfoStateType
} from "@react-native-community/netinfo";
import immer from "immer";
import moment, { Moment } from "moment";
import {
  AppState as AppStatus,
  AppStateStatus as AppStatusType
} from "react-native";
import PushNotifications, {
  PushNotification
} from "react-native-push-notification";
import { REHYDRATE } from "redux-persist";
import { eventChannel } from "redux-saga";
import {
  all,
  call,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest
} from "redux-saga/effects";

import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";
import { ActionTypes as PermissionsActionTypes } from "./permissions";
import { Actions as UserActions } from "./user";

export interface AppState {
  appStatus: AppStatusType;
  networkStatus: NetInfoState & { backendReachable: boolean };
  camera: {
    enabled: boolean;
    timeOfExpiry?: Moment;
  };
}

const initialState: AppState = {
  appStatus: "active",
  networkStatus: {
    type: NetInfoStateType.unknown,
    backendReachable: true,
    isConnected: false,
    isInternetReachable: false,
    details: null
  },
  camera: {
    enabled: false,
    timeOfExpiry: undefined
  }
};

export default (
  state: AppState = initialState,
  action: ActionsUnion<typeof Actions>
): AppState => {
  switch (action.type) {
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

      return immer(state, draft => {
        draft.networkStatus = { ...draft.networkStatus, ...netInfo };

        return draft;
      });
    }

    case ActionTypes.NETWORK_OFFLINE: {
      return immer(state, draft => {
        draft.networkStatus.backendReachable = false;

        return draft;
      });
    }

    case ActionTypes.NETWORK_ONLINE: {
      return immer(state, draft => {
        draft.networkStatus.backendReachable = true;

        return draft;
      });
    }

    default:
      return state;
  }
};

function* onReceiveNotification(
  action: ExtractActionFromActionCreator<typeof Actions.processNotification>
) {
  const { notification } = action.payload;
  const { data }: { data: any } = notification;

  // notification is to start the photo clock
  if (data.photoTime) {
    const { time }: { time: Date } = data;

    const time2 = new Date();
    const expiry = moment(time2).add(10, "minutes");

    yield put(Actions.setCameraTimer(expiry));
  }
}

const appEmitter = () => {
  return eventChannel(emit => {
    const appStatusHandler = (state: AppStatusType) =>
      emit({ appStatus: state });
    const netInfoHandler = (state: NetInfoState) => emit({ netInfo: state });

    AppStatus.addEventListener("change", appStatusHandler);
    const unsubscribe = NetInfo.addEventListener(netInfoHandler);

    return () => {
      unsubscribe();
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
    }: {
      appStatus: AppStatusType;
      netInfo: NetInfoState;
    } = yield take(appChannel);

    if (appStatus) {
      yield put(Actions.setAppStatus(appStatus));
    }

    if (netInfo) {
      yield put(Actions.setNetInfo(netInfo));
    }
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
      yield put(
        UserActions.updateUser({ deviceToken: token.token, deviceOS: token.os })
      );
    }

    if (notification) {
      yield put(Actions.processNotification(notification));
    }
  }
}

function* onBackendOffline() {
  const backendReachable = yield select(selectors.isBackendReachable);

  if (backendReachable) {
    yield put(Actions.networkError());
  }
}

function* onBackendOnline() {
  const backendReachable = yield select(selectors.isBackendReachable);

  if (!backendReachable) {
    yield put(Actions.networkSuccess());
  }
}

const NETWORK_SUCCESS_PATTERN = (action: ActionsUnion<typeof Actions>) =>
  /^.*\/.*_SUCCESS/.test(action.type);

const NETWORK_ERROR_PATTERN = (action: ActionsUnion<typeof Actions>) =>
  /^.*\/ERROR.*/.test(action.type);

export function* appSagas() {
  yield all([
    yield takeEvery(REHYDRATE, onStartup),
    yield takeEvery(ActionTypes.PROCESS_NOTIFICATION, onReceiveNotification),
    yield takeLatest(
      PermissionsActionTypes.SET_NOTIFICATIONS,
      onRegisterNotifications
    ),
    yield takeEvery(NETWORK_SUCCESS_PATTERN, onBackendOnline),
    yield takeEvery(NETWORK_ERROR_PATTERN, onBackendOffline)
  ]);
}

export enum ActionTypes {
  UPDATE_NAVIGATION = "app/UPDATE_NAVIGATION",
  NAVIGATE = "app/NAVIGATE",
  PROCESS_NOTIFICATION = "app/PROCESS_NOTIFICATION",
  SET_CAMERA_TIMER = "app/SET_CAMERA_TIMER",
  EXPIRE_CAMERA = "app/EXPIRE_CAMERA",
  SET_APP_STATUS = "app/SET_APP_STATUS",
  SET_NET_INFO = "app/SET_NET_INFO",
  NETWORK_OFFLINE = "app/NETWORK_OFFLINE",
  NETWORK_ONLINE = "app/NETWORK_ONLINE"
}

export const Actions = {
  processNotification: (notification: PushNotification) =>
    createAction(ActionTypes.PROCESS_NOTIFICATION, { notification }),
  setCameraTimer: (time: Moment) =>
    createAction(ActionTypes.SET_CAMERA_TIMER, { time }),
  expireCamera: () => createAction(ActionTypes.EXPIRE_CAMERA),
  setAppStatus: (status: AppStatusType) =>
    createAction(ActionTypes.SET_APP_STATUS, { status }),
  setNetInfo: (netInfo: NetInfoState) =>
    createAction(ActionTypes.SET_NET_INFO, { netInfo }),
  networkSuccess: () => createAction(ActionTypes.NETWORK_ONLINE),
  networkError: () => createAction(ActionTypes.NETWORK_OFFLINE)
};
