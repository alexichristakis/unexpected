import { all, fork, put, select, take, takeLatest, takeEvery } from "redux-saga/effects";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "./utils";
import Navigation from "../Navigation";
import { PushNotification } from "react-native-push-notification";

export interface AppState {
  currentRoute: string;
  camera: {
    enabled: boolean;
    ts?: Date;
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

  if (data.photoTime) {
  }
}

export function* sagas() {
  yield all([
    takeEvery(ActionTypes.NAVIGATE, onNavigate),
    takeEvery(ActionTypes.PROCESS_NOTIFICATION, onReceiveNotification)
  ]);
}

export enum ActionTypes {
  NAVIGATE = "app/NAVIGATE",
  PROCESS_NOTIFICATION = "app/PROCESS_NOTIFICATION"
}

export const Actions = {
  navigate: (route: string, props?: any) => createAction(ActionTypes.NAVIGATE, { route, props }),
  processNotification: (notification: PushNotification) =>
    createAction(ActionTypes.PROCESS_NOTIFICATION, { notification })
};
