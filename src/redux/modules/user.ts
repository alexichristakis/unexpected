import { Platform } from "react-native";

import { AxiosRequestConfig, AxiosResponse } from "axios";
import immer from "immer";
import _ from "lodash";
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest
} from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { UserType } from "unexpected-cloud/models/user";

import Navigation from "../../navigation";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";

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
    case ActionTypes.FETCH_USER:
    case ActionTypes.FETCH_USERS:
    case ActionTypes.UPDATE_USER:
    case ActionTypes.ACCEPT_REQUEST:
    case ActionTypes.DENY_REQUEST:
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

    case ActionTypes.FRIEND_USER_COMPLETE: {
      const { from, to } = action.payload;

      return immer(state, draft => {
        draft.users[from].requestedFriends.push(to);
        draft.users[to].friendRequests.push(from);
        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.ACCEPT_REQUEST_COMPLETE: {
      const { from, to } = action.payload;

      return immer(state, draft => {
        draft.users[from].friends.push(to);
        draft.users[to].friends.push(from);

        draft.users[from].friendRequests = _.remove(
          draft.users[from].friendRequests,
          to
        );
        draft.users[to].requestedFriends = _.remove(
          draft.users[to].requestedFriends,
          from
        );

        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.DENY_REQUEST_COMPLETE: {
      const { from, to } = action.payload;

      return immer(state, draft => {
        draft.users[from].requestedFriends = _.remove(
          draft.users[from].requestedFriends,
          to
        );
        draft.users[to].friendRequests = _.remove(
          draft.users[to].friendRequests,
          from
        );

        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.LOAD_USERS: {
      const { users, complete } = action.payload;

      return immer(state, draft => {
        users.forEach(user => {
          if (complete) {
            draft.users[user.phoneNumber] = user;
          } else {
            draft.users[user.phoneNumber] = _.merge(
              draft.users[user.phoneNumber],
              user
            );
          }
        });

        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.ON_ERROR: {
      const { err } = action.payload;

      return { ...state, error: err };
    }

    default:
      return state;
  }
};

function* onFetchUser(
  action: ExtractActionFromActionCreator<typeof Actions.fetchUser>
) {
  const jwt = yield select(selectors.jwt);
  const userPhoneNumber = yield select(selectors.phoneNumber);

  try {
    const { phoneNumber } = action.payload;

    const endpoint = phoneNumber
      ? `/user/${phoneNumber}`
      : `/user/${userPhoneNumber}`;

    const res: AxiosResponse<UserType> = yield call(client.get, endpoint, {
      headers: getHeaders({ jwt })
    });

    const { data } = res;
    yield put(Actions.loadUsers([data], true));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onCreateUser(
  action: ExtractActionFromActionCreator<typeof Actions.createUser>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.authPhoneNumber);

  const { name } = action.payload;

  const newUser: UserType = {
    ...name,
    phoneNumber,
    friends: [],
    friendRequests: [],
    requestedFriends: [],
    deviceOS: Platform.OS,
    bio: "",
    timezone: "America/New_York"
  };

  if (phoneNumber === "0000000000") {
    yield all([
      yield put(Actions.createUserComplete(newUser)),
      yield Navigation.navigate("AUTHENTICATED")
    ]);
  } else
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

function* onFetchUsers(
  action: ExtractActionFromActionCreator<typeof Actions.fetchUsers>
) {
  const jwt = yield select(selectors.jwt);
  const { phoneNumbers, selectOn } = action.payload;

  try {
    let endpoint = `/user?phoneNumbers=${phoneNumbers.join(",")}`;
    if (selectOn) endpoint += `&select=${selectOn.join(",")}`;

    const res: AxiosResponse<UserType[]> = yield client.get(endpoint, {
      headers: getHeaders({ jwt })
    });

    const { data } = res;

    yield put(Actions.loadUsers(data));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onAcceptRequest(
  action: ExtractActionFromActionCreator<typeof Actions.acceptRequest>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);

  try {
    const { user } = action.payload;

    const res = yield call(
      client.patch,
      `/user/${phoneNumber}/accept/${user.phoneNumber}`,
      {},
      { headers: getHeaders({ jwt }) }
    );

    yield put(Actions.acceptRequestComplete(phoneNumber, user.phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onDenyRequest(
  action: ExtractActionFromActionCreator<typeof Actions.denyRequest>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);

  try {
    const { user } = action.payload;

    const res = yield call(
      client.patch,
      `/user/${phoneNumber}/deny/${user.phoneNumber}`,
      {},
      { headers: getHeaders({ jwt }) }
    );

    yield put(Actions.denyRequestComplete(phoneNumber, user.phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onFriendUser(
  action: ExtractActionFromActionCreator<typeof Actions.friendUser>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);
  const { user } = action.payload;

  try {
    yield call(
      client.patch,
      `user/${phoneNumber}/friend/${user.phoneNumber}`,
      {},
      {
        headers: getHeaders({ jwt })
      }
    );

    yield put(Actions.friendComplete(phoneNumber, user.phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

export function* userSagas() {
  yield all([
    yield takeLatest(ActionTypes.FETCH_USER, onFetchUser),
    yield takeLatest(ActionTypes.FETCH_USERS, onFetchUsers),
    yield takeLatest(ActionTypes.CREATE_NEW_USER, onCreateUser),
    yield takeLatest(ActionTypes.UPDATE_USER, onUpdateUser),
    // yield takeLatest(ActionTypes.FETCH_FRIENDS, onFetchFriends),
    yield takeLatest(ActionTypes.FRIEND_USER, onFriendUser),
    yield takeEvery(ActionTypes.ACCEPT_REQUEST, onAcceptRequest),
    yield takeEvery(ActionTypes.DENY_REQUEST, onDenyRequest)
  ]);
}

export enum ActionTypes {
  CREATE_NEW_USER = "user/CREATE_NEW_USER",
  CREATE_USER_COMPLETE = "user/CREATE_USER_COMPLETE",
  FETCH_USER = "user/FETCH_USER",
  FETCH_USERS = "user/FETCH_USERS",
  UPDATE_USER = "user/UPDATE_USER",
  UPDATE_COMPLETE = "user/UPDATE_COMPLETE",
  FRIEND_USER = "user/FRIEND_USER",
  FRIEND_USER_COMPLETE = "user/FRIEND_USER_COMPLETE",
  ACCEPT_REQUEST = "user/ACCEPT_REQUEST",
  ACCEPT_REQUEST_COMPLETE = "user/ACCEPT_REQUEST_COMPLETE",
  DENY_REQUEST = "user/DENY_REQUEST",
  DENY_REQUEST_COMPLETE = "user/DENY_REQUEST_COMPLETE",
  // FETCH_FRIENDS = "user/FETCH_FRIENDS",
  LOAD_USERS = "user/LOAD_USERS",
  ON_ERROR = "user/ON_ERROR"
}

export const Actions = {
  fetchUser: (phoneNumber?: string) =>
    createAction(ActionTypes.FETCH_USER, { phoneNumber }),
  fetchUsers: (phoneNumbers: string[], selectOn?: string[]) =>
    createAction(ActionTypes.FETCH_USERS, { phoneNumbers, selectOn }),
  createUser: (name: { firstName: string; lastName: string }) =>
    createAction(ActionTypes.CREATE_NEW_USER, { name }),
  createUserComplete: (user: UserType) =>
    createAction(ActionTypes.CREATE_USER_COMPLETE, { user }),
  loadUsers: (users: UserType[], complete?: boolean) =>
    createAction(ActionTypes.LOAD_USERS, { users, complete }),
  updateUser: (user: Partial<UserType>) =>
    createAction(ActionTypes.UPDATE_USER, { user }),
  updateComplete: () => createAction(ActionTypes.UPDATE_COMPLETE),

  /* adding friends, accepting friends, etc... */
  friendUser: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.FRIEND_USER, { user }),
  friendComplete: (from: string, to: string) =>
    createAction(ActionTypes.FRIEND_USER_COMPLETE, { from, to }),
  acceptRequest: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.ACCEPT_REQUEST, { user }),
  acceptRequestComplete: (from: string, to: string) =>
    createAction(ActionTypes.ACCEPT_REQUEST_COMPLETE, { from, to }),
  denyRequest: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.DENY_REQUEST, { user }),
  denyRequestComplete: (from: string, to: string) =>
    createAction(ActionTypes.DENY_REQUEST_COMPLETE, { from, to }),

  // fetchFriends: (phoneNumber: string) =>
  //   createAction(ActionTypes.FETCH_FRIENDS, { phoneNumber }),
  onError: (err: string) => createAction(ActionTypes.ON_ERROR, { err })
};
