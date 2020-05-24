import { Platform } from "react-native";

import { AxiosResponse } from "axios";
import immer from "immer";
import _ from "lodash";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { REHYDRATE } from "redux-persist";
import { all, call, put, select, takeLatest } from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { NewUser, PartialUser, User } from "@global";

import { StackParamList } from "../../App";
import * as selectors from "../selectors";
import {
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";

export interface UserState {
  user: User;
  users: { [phoneNumber: string]: PartialUser };
  stale: boolean;
  loading: boolean;
  loadingRequests: boolean;
  error: any;
}

const initialState: UserState = {
  user: {} as User,
  users: {},
  stale: false,
  loading: false,
  loadingRequests: false,
  error: null,
};

export default (
  state: UserState = initialState,
  action: ActionUnion
): UserState => {
  switch (action.type) {
    case ActionTypes.FETCH_USER:
    case ActionTypes.FETCH_USERS:
    case ActionTypes.UPDATE_USER:
    case ActionTypes.CREATE_NEW_USER: {
      return { ...state, loading: true, error: null };
    }

    case ActionTypes.CREATE_USER_SUCCESS: {
      const { user } = action.payload;

      return immer(state, (draft) => {
        draft.loading = false;
        draft.user = user;
      });
    }

    case ActionTypes.FETCH_FRIENDS_SUCCESS:
    case ActionTypes.FETCH_FEED_SUCCESS:
    case ActionTypes.SEARCH_SUCCESS:
    case ActionTypes.LOAD_USERS: {
      const { users } = action.payload;

      return immer(state, (draft) => {
        users.forEach((user) => {
          draft.users[user.id] = user;
        });

        draft.loading = false;
      });
    }

    case ActionTypes.FETCH_USERS_REQUESTS_SUCCESS: {
      const { requestedFriends, friendRequests } = action.payload;

      return immer(state, (draft) => {
        [...requestedFriends, ...friendRequests].forEach((user) => {
          draft.users[user.id] = user;
        });
      });
    }

    case ActionTypes.USER_ERROR: {
      const { err } = action.payload;

      return { ...state, loading: false, error: err };
    }

    default:
      return state;
  }
};

function* onFetchUser(
  action: ExtractActionFromActionCreator<typeof Actions.fetchUser>
) {
  const jwt = yield select(selectors.jwt);

  try {
    const { id } = action.payload;

    const endpoint = id ? `/user/${id}` : `/user`;

    const res: AxiosResponse<User> = yield call(client.get, endpoint, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;
    yield put(Actions.loadUsers([data]));
  } catch (err) {
    yield put(Actions.onUserError(err));
  }
}

function* onCreateUser(
  action: ExtractActionFromActionCreator<typeof Actions.createUser>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.authPhoneNumber);

  const { firstName, lastName, navigation } = action.payload;

  const newUser: NewUser = {
    firstName,
    lastName,
    phoneNumber,
    deviceOS: Platform.OS,
    timezone: "America/New_York",
  };

  if (phoneNumber === "0000000000") {
    yield put(Actions.createUserSuccess({ ...newUser, id: "TEST" } as User));
    navigation.navigate("AUTHENTICATED");
  } else {
    try {
      const res: AxiosResponse<User> = yield client.put(
        "/user",
        { user: newUser },
        {
          headers: getHeaders({ jwt }),
        }
      );

      const { data: createdUser } = res;

      yield put(Actions.createUserSuccess(createdUser));
      navigation.navigate("AUTHENTICATED");
    } catch (err) {
      yield put(Actions.onUserError(err));
    }
  }
}

function* onUpdateUser(
  action: ExtractActionFromActionCreator<typeof Actions.updateUser>
) {
  const jwt = yield select(selectors.jwt);

  const { user } = action.payload;
  try {
    const res: AxiosResponse<PartialUser> = yield call(
      client.patch,
      `/user`,
      { user: { ...user } },
      { headers: getHeaders({ jwt }) }
    );

    const { data } = res;

    yield put(Actions.loadUsers([data]));
  } catch (err) {
    yield put(Actions.onUserError(err));
  }
}

function* onFetchUsers(
  action: ExtractActionFromActionCreator<typeof Actions.fetchUsers>
) {
  const jwt = yield select(selectors.jwt);
  const { ids, selectOn } = action.payload;

  try {
    let endpoint = `/user/multiple?ids=${ids.join(",")}`;
    if (selectOn) endpoint += `&select=${selectOn.join(",")}`;

    const res: AxiosResponse<User[]> = yield client.get(endpoint, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;

    yield put(Actions.loadUsers(data));
  } catch (err) {
    yield put(Actions.onUserError(err));
  }
}

function* onStartup() {
  // const jwt = yield select(selectors.jwt);
  // const user = yield select(selectors.currentUser);
  // if (jwt) {
  //   const timezone = moment.tz.guess(true);
  //   if (timezone !== user.timezone) yield put(Actions.updateUser({ timezone }));
  // }
}

export function* userSagas() {
  yield all([
    yield takeLatest(REHYDRATE, onStartup),
    yield takeLatest(ActionTypes.FETCH_USER, onFetchUser),
    yield takeLatest(ActionTypes.FETCH_USERS, onFetchUsers),
    yield takeLatest(ActionTypes.CREATE_NEW_USER, onCreateUser),
    yield takeLatest(ActionTypes.UPDATE_USER, onUpdateUser),
  ]);
}

export const Actions = {
  fetchUser: (id?: string) => createAction(ActionTypes.FETCH_USER, { id }),
  fetchUsers: (ids: string[], selectOn?: string[]) =>
    createAction(ActionTypes.FETCH_USERS, { ids, selectOn }),
  createUser: (
    firstName: string,
    lastName: string,
    navigation: NativeStackNavigationProp<StackParamList>
  ) =>
    createAction(ActionTypes.CREATE_NEW_USER, {
      firstName,
      lastName,
      navigation,
    }),
  createUserSuccess: (user: User) =>
    createAction(ActionTypes.CREATE_USER_SUCCESS, { user }),

  loadUsers: (users: PartialUser[]) =>
    createAction(ActionTypes.LOAD_USERS, { users }),
  updateUser: (user: Partial<User>) =>
    createAction(ActionTypes.UPDATE_USER, { user }),

  onUserError: (err: string) => createAction(ActionTypes.USER_ERROR, { err }),
};
