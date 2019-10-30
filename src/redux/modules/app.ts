import { all, fork, put, select, take, takeLatest, takeEvery } from "redux-saga/effects";
import { PushNotification } from "react-native-push-notification";
import moment, { Moment } from "moment";

import Navigation from "../../Navigation";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";

export interface AppState {
  currentRoute: string;
  camera: {
    enabled: boolean;
    timeOfExpiry?: Moment;
  };
}

const initialState: AppState = {
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

export function* appSagas() {
  yield all([
    takeEvery(ActionTypes.NAVIGATE, onNavigate),
    takeEvery(ActionTypes.PROCESS_NOTIFICATION, onReceiveNotification)
  ]);
}

export enum ActionTypes {
  NAVIGATE = "app/NAVIGATE",
  PROCESS_NOTIFICATION = "app/PROCESS_NOTIFICATION",
  SET_CAMERA_TIMER = "app/SET_CAMERA_TIMER",
  EXPIRE_CAMERA = "app/EXPIRE_CAMERA"
}

export const Actions = {
  navigate: (route: string, props?: any) => createAction(ActionTypes.NAVIGATE, { route, props }),
  processNotification: (notification: PushNotification) =>
    createAction(ActionTypes.PROCESS_NOTIFICATION, { notification }),
  setCameraTimer: (time: Moment) => createAction(ActionTypes.SET_CAMERA_TIMER, { time }),
  expireCamera: () => createAction(ActionTypes.EXPIRE_CAMERA)
};
