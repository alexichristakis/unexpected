import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import immer from "immer";
import moment, { Moment } from "moment";
import {
  AppState as AppStatus,
  AppStateStatus as AppStatusType,
  Platform,
} from "react-native";
import { Notification, Notifications } from "react-native-notifications";
import { REHYDRATE } from "redux-persist";
import { eventChannel } from "redux-saga";
import { all, call, put, select, take, takeEvery } from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { NOTIFICATION_MINUTES } from "@lib";
import * as selectors from "../selectors";
import { ActionTypes, ActionUnion, createAction } from "../types";

export interface AppState {
  appStatus: AppStatusType;
  networkStatus: {
    isConnected: boolean;
    isInternetReachable: boolean;
    isBackendReachable: boolean;
  };
  camera: {
    enabled: boolean;
    timeOfExpiry?: string;
  };
}

const initialState: AppState = {
  appStatus: "active",
  networkStatus: {
    isConnected: false,
    isInternetReachable: false,
    isBackendReachable: true,
  },
  camera: {
    enabled: false,
    timeOfExpiry: undefined,
  },
};

export default (
  state: AppState = initialState,
  action: ActionUnion
): AppState => {
  switch (action.type) {
    case ActionTypes.SET_CAMERA_TIMER: {
      const { time } = action.payload;

      return {
        ...state,
        camera: { enabled: true, timeOfExpiry: time.toISOString() },
      };
    }

    case ActionTypes.DEBUG_ENABLE_CAMERA: {
      const timeOfExpiry = moment().add(10, "hours").toISOString();

      return {
        ...state,
        camera: {
          enabled: true,
          timeOfExpiry,
        },
      };
    }

    case ActionTypes.SEND_POST_SUCCESS: {
      return {
        ...state,
        camera: { enabled: false, timeOfExpiry: undefined },
      };
    }

    case ActionTypes.SET_APP_STATUS: {
      const { status } = action.payload;

      return { ...state, appStatus: status };
    }

    case ActionTypes.SET_NET_INFO: {
      const { netInfo } = action.payload;
      const { isInternetReachable, isConnected } = netInfo;

      return immer(state, (draft) => {
        draft.networkStatus.isInternetReachable = !!isInternetReachable;
        draft.networkStatus.isConnected = !!isConnected;

        return draft;
      });
    }

    case ActionTypes.NETWORK_OFFLINE: {
      return immer(state, (draft) => {
        draft.networkStatus.isBackendReachable = false;

        return draft;
      });
    }

    case ActionTypes.NETWORK_ONLINE: {
      return immer(state, (draft) => {
        draft.networkStatus.isBackendReachable = true;

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
      netInfo,
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

const appEmitter = () =>
  eventChannel((emit) => {
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

function* checkCameraStatus() {
  // const jwt = yield select(selectors.jwt);
  // if (jwt) {
  //   // check if camera should be enabled
  //   const phoneNumber = yield select(selectors.phoneNumber);
  //   try {
  //     const res = yield client.get(`/user/${phoneNumber}/camera`, {
  //       headers: getHeaders({ jwt }),
  //     });
  //     const {
  //       data: { enabled, start },
  //     } = res;
  //     if (enabled) {
  //       yield put(
  //         Actions.setCameraTimer(
  //           moment(start).add(NOTIFICATION_MINUTES, "minutes")
  //         )
  //       );
  //     }
  //   } catch (err) {
  //     yield put(Actions.networkError());
  //   }
  // }
}

function* onStartup() {
  // start event channels
  // yield all([call(appWatcher), call(checkCameraStatus)]);
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

const NETWORK_SUCCESS_PATTERN = (action: ActionUnion) =>
  /^.*\/.*_SUCCESS/.test(action.type);

const NETWORK_ERROR_PATTERN = (action: ActionUnion) =>
  /^.*\/ERROR.*/.test(action.type);

export function* appSagas() {
  yield all([
    yield takeEvery(REHYDRATE, onStartup),
    yield takeEvery(NETWORK_SUCCESS_PATTERN, onBackendOnline),
    yield takeEvery(NETWORK_ERROR_PATTERN, onBackendOffline),
  ]);
}

export const Actions = {
  processNotification: (notification: Notification) =>
    createAction(ActionTypes.PROCESS_NOTIFICATION, { notification }),
  setCameraTimer: (time: Moment) =>
    createAction(ActionTypes.SET_CAMERA_TIMER, { time }),
  enableCamera: () => createAction(ActionTypes.DEBUG_ENABLE_CAMERA),
  setAppStatus: (status: AppStatusType) =>
    createAction(ActionTypes.SET_APP_STATUS, { status }),
  setNetInfo: (netInfo: NetInfoState) =>
    createAction(ActionTypes.SET_NET_INFO, { netInfo }),
  networkSuccess: () => createAction(ActionTypes.NETWORK_ONLINE),
  networkError: () => createAction(ActionTypes.NETWORK_OFFLINE),
};
