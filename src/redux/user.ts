import { AxiosResponse } from "axios";
import { Platform } from "react-native";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { UserType } from "unexpected-cloud/models/user";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "./utils";
import * as selectors from "./selectors";

import Navigation from "../Navigation";

export interface UserState {
  readonly user: UserType | null;
  readonly loading: boolean;
  readonly error: any;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null
};

export type AuthActionTypes = ActionsUnion<typeof Actions>;
export default (state: UserState = initialState, action: AuthActionTypes) => {
  switch (action.type) {
    case ActionTypes.ON_CREATE_NEW_USER: {
      return { ...state, loading: true, error: null };
    }

    case ActionTypes.SUCCESS_CREATING_USER: {
      const { user } = action.payload;
      return { ...state, loading: false, user };
    }

    default:
      return state;
  }
};

function* onCreateUser(action: ExtractActionFromActionCreator<typeof Actions.createUser>) {
  const jwtToken = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);

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
        headers: getHeaders({ jwtToken })
      }
    );

    const { data: createdUser } = res;

    yield put(Actions.successCreatingUser(createdUser));
  } catch (err) {
    console.log(err);
    yield put(Actions.onError(err));
  }
}

export function* userSagas() {
  yield all([yield takeLatest(ActionTypes.ON_CREATE_NEW_USER, onCreateUser)]);
}

export enum ActionTypes {
  ON_CREATE_NEW_USER = "user/ON_CREATE_NEW_USER",
  SUCCESS_CREATING_USER = "user/SUCCESS_CREATING_USER",
  ON_ERROR = "user/ON_ERROR",
  UPDATE_USER = "user/UPDATE_USER"
}

export const Actions = {
  createUser: (name: { firstName: string; lastName: string }) =>
    createAction(ActionTypes.ON_CREATE_NEW_USER, { name }),
  successCreatingUser: (user: UserType) =>
    createAction(ActionTypes.SUCCESS_CREATING_USER, { user }),
  onError: (err: string) => createAction(ActionTypes.ON_ERROR, { err }),
  updateUser: (user: Partial<UserType>) => createAction(ActionTypes.UPDATE_USER, { user })
};
