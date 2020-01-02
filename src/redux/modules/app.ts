import NetInfo, {
  NetInfoState,
  NetInfoStateType
} from "@react-native-community/netinfo";
import immer from "immer";
import moment, { Moment } from "moment-timezone";
import {
  AppState as AppStatus,
  AppStateStatus as AppStatusType,
  Platform
} from "react-native";
import { Notification, Notifications } from "react-native-notifications";
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

import client, { getHeaders } from "@api";
import { TIMER_LENGTH } from "@lib/styles";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";
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

    case ActionTypes.DEBUG_ENABLE_CAMERA: {
      return {
        ...state,
        camera: { enabled: true, timeOfExpiry: moment().add(10, "hours") }
      };
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

function* appWatcher() {
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
      if (appStatus === "active") {
        yield call(checkCameraStatus);
      }

      yield put(Actions.setAppStatus(appStatus));
    }

    if (netInfo) {
      yield put(Actions.setNetInfo(netInfo));
    }
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

function* notificationWatcher() {
  const notificationChannel = yield call(notificationEmitter);

  while (true) {
    const { token, notification } = yield take(notificationChannel);

    // new token received
    if (token) {
      yield put(
        UserActions.updateUser({
          deviceToken: token,
          deviceOS: Platform.OS
        })
      );
    }

    // notification
    if (notification) {
      const { data }: { data: any } = notification;

      // notification is to start the photo clock
      if (data.photoTime) {
        const { time }: { time: Date } = data;

        const expiry = moment(time).add(TIMER_LENGTH, "minutes");

        yield put(Actions.setCameraTimer(expiry));
      }
    }
  }
}

const notificationEmitter = () => {
  return eventChannel(emit => {
    Notifications.events().registerRemoteNotificationsRegistered(event => {
      emit({ token: event.deviceToken });
    });

    Notifications.events().registerNotificationReceived(
      (notification, complete) => {
        emit({ notification });
        complete({ badge: false, alert: false, sound: false });
      }
    );

    Notifications.events().registerRemoteNotificationOpened(
      (notification, completion) => {
        emit({ notification });
        completion();
      }
    );

    return () => {};
  });
};

function* checkCameraStatus() {
  const jwt = yield select(selectors.jwt);
  if (jwt) {
    // check if camera should be enabled
    const phoneNumber = yield select(selectors.phoneNumber);

    try {
      const {
        data: { enabled, start }
      } = yield call(client.get, `/user/${phoneNumber}/camera`, {
        headers: getHeaders({ jwt })
      });

      if (enabled) {
        yield put(
          Actions.setCameraTimer(moment(start).add(TIMER_LENGTH, "minutes"))
        );
      }
    } catch (err) {
      yield put(Actions.networkError());
    }
  }
}

function* onStartup() {
  // start event channels
  yield all([
    call(appWatcher),
    call(notificationWatcher),
    call(checkCameraStatus)
  ]);
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
  NETWORK_ONLINE = "app/NETWORK_ONLINE",
  DEBUG_ENABLE_CAMERA = "debug/ENABLE_CAMERA"
}

export const Actions = {
  processNotification: (notification: Notification) =>
    createAction(ActionTypes.PROCESS_NOTIFICATION, { notification }),
  setCameraTimer: (time: Moment) =>
    createAction(ActionTypes.SET_CAMERA_TIMER, { time }),
  enableCamera: () => createAction(ActionTypes.DEBUG_ENABLE_CAMERA),
  expireCamera: () => createAction(ActionTypes.EXPIRE_CAMERA),
  setAppStatus: (status: AppStatusType) =>
    createAction(ActionTypes.SET_APP_STATUS, { status }),
  setNetInfo: (netInfo: NetInfoState) =>
    createAction(ActionTypes.SET_NET_INFO, { netInfo }),
  networkSuccess: () => createAction(ActionTypes.NETWORK_ONLINE),
  networkError: () => createAction(ActionTypes.NETWORK_OFFLINE)
};
