import { Platform } from "react-native";

import { AxiosResponse } from "axios";
import {
  all,
  call,
  fork,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";
import immer from "immer";

import client, { getHeaders } from "@api";
import { UserType } from "unexpected-cloud/models/user";

import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";

import Navigation from "../../Navigation";

export interface UserState {
  // readonly user: UserType;
  readonly phoneNumber: string;
  readonly users: { [phoneNumber: string]: UserType };
  readonly loading: boolean;
  readonly error: any;
}

const initialState: UserState = {
  phoneNumber: "",
  users: {},
  loading: false,
  error: null
};

export default (
  state: UserState = initialState,
  action: ActionsUnion<typeof Actions>
): UserState => {
  switch (action.type) {
    case ActionTypes.UPDATE_USER:
    case ActionTypes.FETCH_FOLLOWING:
    case ActionTypes.CREATE_NEW_USER: {
      return { ...state, loading: true, error: null };
    }

    case ActionTypes.CREATE_USER_COMPLETE: {
      const { user } = action.payload;

      return immer(state, draft => {
        draft.loading = false;
        draft.phoneNumber = user.phoneNumber;
        draft.users[user.phoneNumber] = user;

        return draft;
      });
    }

    case ActionTypes.LOAD_USERS: {
      const { users } = action.payload;

      return immer(state, draft => {
        users.forEach(user => {
          draft.users[user.phoneNumber] = user;
        });

        draft.loading = false;

        return draft;
      });
    }

    default:
      return state;
  }
};

function* onCreateUser(
  action: ExtractActionFromActionCreator<typeof Actions.createUser>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.authPhoneNumber);

  const { name } = action.payload;

  const newUser: UserType = {
    ...name,
    phoneNumber,
    following: [],
    deviceOS: Platform.OS,
    timezone: "America/New_York"
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
      yield put(Actions.createUserComplete(createdUser)),
      yield Navigation.navigate("AUTHENTICATED")
    ]);
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onUpdateUser(
  action: ExtractActionFromActionCreator<typeof Actions.updateUser>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);

  const { user } = action.payload;

  try {
    const res: AxiosResponse<UserType> = yield client.patch(
      `/user/${phoneNumber}`,
      { user: { ...user } },
      {
        headers: getHeaders({ jwt })
      }
    );

    const { data } = res;

    yield put(Actions.loadUsers([data]));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onFetchFollowing(
  action: ExtractActionFromActionCreator<typeof Actions.fetchFollowing>
) {
  const jwt = yield select(selectors.jwt);
  const { phoneNumber } = action.payload;

  try {
    const res: AxiosResponse<UserType[]> = yield client.get(
      `user/${phoneNumber}/following`,
      {
        headers: getHeaders({ jwt })
      }
    );

    const { data } = res;

    yield put(Actions.loadUsers(data));
  } catch (err) {}
}

export function* userSagas() {
  yield all([
    yield takeLatest(ActionTypes.CREATE_NEW_USER, onCreateUser),
    yield takeLatest(ActionTypes.UPDATE_USER, onUpdateUser),
    yield takeLatest(ActionTypes.FETCH_FOLLOWING, onFetchFollowing)
  ]);
}

export enum ActionTypes {
  CREATE_NEW_USER = "user/CREATE_NEW_USER",
  CREATE_USER_COMPLETE = "user/CREATE_USER_COMPLETE",
  UPDATE_USER = "user/UPDATE_USER",
  UPDATE_COMPLETE = "user/UPDATE_COMPLETE",
  FETCH_FOLLOWING = "user/FETCH_FOLLOWING",
  LOAD_USERS = "user/LOAD_USERS",
  ON_ERROR = "user/ON_ERROR"
}

export const Actions = {
  createUser: (name: { firstName: string; lastName: string }) =>
    createAction(ActionTypes.CREATE_NEW_USER, { name }),
  createUserComplete: (user: UserType) =>
    createAction(ActionTypes.CREATE_USER_COMPLETE, { user }),
  loadUsers: (users: UserType[]) =>
    createAction(ActionTypes.LOAD_USERS, { users }),
  updateUser: (user: Partial<UserType>) =>
    createAction(ActionTypes.UPDATE_USER, { user }),
  updateComplete: () => createAction(ActionTypes.UPDATE_COMPLETE),
  fetchFollowing: (phoneNumber: string) =>
    createAction(ActionTypes.FETCH_FOLLOWING, { phoneNumber }),
  onError: (err: string) => createAction(ActionTypes.ON_ERROR, { err })
};
