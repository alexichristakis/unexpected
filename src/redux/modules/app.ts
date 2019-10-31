import { AppState as AppStatus, AppStateStatus as AppStatusType } from "react-native";
import NetInfo, { NetInfoState, NetInfoStateType } from "@react-native-community/netinfo";
import { eventChannel } from "redux-saga";
import { all, call, fork, put, select, take, takeLatest, takeEvery } from "redux-saga/effects";
import { PushNotification } from "react-native-push-notification";
import moment, { Moment } from "moment";

import Navigation from "../../Navigation";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";
import { REHYDRATE } from "redux-persist";

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
    enabled: false
  }
};

export type AppActionTypes = ActionsUnion<typeof Actions>;
export default (state: AppState = initialState, action: AppActionTypes) => {
  switch (action.type) {
    case ActionTypes.NAVIGATE: {
      const { route } = action.payload;
      return { ...state, currentRoute: route };
    }

    case ActionTypes.SET_CAMERA_TIMER: {
      const { time } = action.payload;
      return { ...state, camera: { enabled: true, timeOfExpiry: time } };
    }

    case ActionTypes.EXPIRE_CAMERA: {
      return { ...state, camera: { enabled: false, timeOfExpiry: null } };
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

function* onNavigate(action: ExtractActionFromActionCreator<typeof Actions.navigate>) {
  const { route, props } = action.payload;
  yield Navigation.navigate({ routeName: route });
}

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
    AppStatus.addEventListener("change", state => emit({ appStatus: state }));
    const unsubscribe = NetInfo.addEventListener(state => emit({ netInfo: state }));

    return () => {
      unsubscribe();
      AppStatus.removeEventListener("change", emit);
    };
  });
};

function* onStartup() {
  const appChannel = yield call(appEmitter);

  while (true) {
    const { appStatus, netInfo }: { appStatus: AppStatusType; netInfo: NetInfoState } = yield take(
      appChannel
    );

    if (appStatus) {
      yield put(Actions.setAppStatus(appStatus));
    }

    if (netInfo) {
      yield put(Actions.setNetInfo(netInfo));
    }
  }
}

export function* appSagas() {
  yield all([
    takeEvery(REHYDRATE, onStartup),
    takeEvery(ActionTypes.NAVIGATE, onNavigate),
    takeEvery(ActionTypes.PROCESS_NOTIFICATION, onReceiveNotification)
  ]);
}

export enum ActionTypes {
  NAVIGATE = "app/NAVIGATE",
  PROCESS_NOTIFICATION = "app/PROCESS_NOTIFICATION",
  SET_CAMERA_TIMER = "app/SET_CAMERA_TIMER",
  EXPIRE_CAMERA = "app/EXPIRE_CAMERA",
  SET_NET_INFO = "app/SET_NET_INFO",
  SET_APP_STATUS = "app/SET_APP_STATUS"
}

export const Actions = {
  navigate: (route: string, props?: any) => createAction(ActionTypes.NAVIGATE, { route, props }),
  processNotification: (notification: PushNotification) =>
    createAction(ActionTypes.PROCESS_NOTIFICATION, { notification }),
  setCameraTimer: (time: Moment) => createAction(ActionTypes.SET_CAMERA_TIMER, { time }),
  expireCamera: () => createAction(ActionTypes.EXPIRE_CAMERA),
  setAppStatus: (status: AppStatusType) => createAction(ActionTypes.SET_APP_STATUS, { status }),
  setNetInfo: (netInfo: NetInfoState) => createAction(ActionTypes.SET_NET_INFO, { netInfo })
};
