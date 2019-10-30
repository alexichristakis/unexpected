import { AxiosResponse } from "axios";
import PushNotification from "react-native-push-notification";
import { Platform } from "react-native";
import { eventChannel } from "redux-saga";
import { all, fork, put, call, select, take, takeLatest } from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { UserType } from "unexpected-cloud/models/user";

import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "./utils";
import { Actions as AppActions } from "./app";
import { Actions as AuthActions } from "./auth";
import { ActionTypes as PermissionsActionTypes } from "./permissions";
import * as selectors from "./selectors";

import Navigation from "../Navigation";
import { REHYDRATE } from "redux-persist";

export interface UserState {
  readonly user: Partial<UserType>;
  readonly loading: boolean;
  readonly error: any;
}

const initialState: UserState = {
  user: {},
  loading: false,
  error: null
};

export type AuthActionTypes = ActionsUnion<typeof Actions>;
export default (state: UserState = initialState, action: AuthActionTypes) => {
  switch (action.type) {
    case ActionTypes.ON_CREATE_NEW_USER: {
      return { ...state, loading: true, error: null };
    }

    case ActionTypes.ON_UPDATE_USER: {
      return { ...state, user: { ...state.user, ...action.payload.user }, loading: true };
    }

    case ActionTypes.ON_UPDATE_COMPLETE: {
      return { ...state, loading: false, error: null };
    }

    case ActionTypes.LOAD_USER: {
      const { user } = action.payload;
      return { ...state, loading: false, user };
    }

    default:
      return state;
  }
};

function* onCreateUser(action: ExtractActionFromActionCreator<typeof Actions.createUser>) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.authPhoneNumber);

  const { name } = action.payload;

  const newUser: UserType = {
    ...name,
    phoneNumber,
    deviceOS: Platform.OS,
    timezone: "EST"
  };

  try {
    const res: AxiosResponse<UserType> = yield client.put(
      "/user",
      { user: newUser },
      {
        headers: getHeaders({ jwt })
      }
    );

    const { data: createdUser } = res;

    yield all([
      yield put(Actions.loadUser(createdUser)),
      yield put(AuthActions.completedAuthFlow()),
      yield Navigation.navigate({ routeName: "Home" })
    ]);
  } catch (err) {
    console.log(err);
    yield put(Actions.onError(err));
  }
}

function* onUpdateUser(action: ExtractActionFromActionCreator<typeof Actions.updateUser>) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);

  const { user } = action.payload;

  try {
    yield client.patch(
      `/user/${phoneNumber}`,
      { user: { ...user } },
      {
        headers: getHeaders({ jwt })
      }
    );

    yield put(Actions.updateComplete());
  } catch (err) {
    console.log(err);
    yield put(Actions.onError(err));
  }
}

const notificationEmitter = () => {
  return eventChannel(emit => {
    PushNotification.configure({
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
      yield put(Actions.updateUser({ deviceToken: token.token, deviceOS: token.os }));
    }

    if (notification) {
      yield put(AppActions.processNotification(notification));
    }
  }
}

export function* userSagas() {
  yield all([
    yield takeLatest(ActionTypes.ON_CREATE_NEW_USER, onCreateUser),
    yield takeLatest(ActionTypes.ON_UPDATE_USER, onUpdateUser),
    yield takeLatest(PermissionsActionTypes.SET_NOTIFICATIONS, onRegisterNotifications)
  ]);
}

export enum ActionTypes {
  ON_CREATE_NEW_USER = "user/ON_CREATE_NEW_USER",
  ON_UPDATE_USER = "user/ON_UPDATE_USER",
  ON_UPDATE_COMPLETE = "user/ON_UPDATE_COMPLETE",
  LOAD_USER = "user/LOAD_USER",
  ON_ERROR = "user/ON_ERROR"
}

export const Actions = {
  createUser: (name: { firstName: string; lastName: string }) =>
    createAction(ActionTypes.ON_CREATE_NEW_USER, { name }),
  loadUser: (user: UserType) => createAction(ActionTypes.LOAD_USER, { user }),
  onError: (err: string) => createAction(ActionTypes.ON_ERROR, { err }),
  updateUser: (user: Partial<UserType>) => createAction(ActionTypes.ON_UPDATE_USER, { user }),
  updateComplete: () => createAction(ActionTypes.ON_UPDATE_COMPLETE)
};
