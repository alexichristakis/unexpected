import { Platform } from "react-native";

import { AxiosRequestConfig, AxiosResponse } from "axios";
import immer from "immer";
import _ from "lodash";
import moment from "moment-timezone";
import { REHYDRATE } from "redux-persist";
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest
} from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { User } from "@unexpected/global";

import { navigate } from "../../navigation";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";

export interface UserState {
  // readonly user: User;
  phoneNumber: string;
  users: { [phoneNumber: string]: User };
  loading: boolean;
  error: any;
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
    case ActionTypes.FRIEND_USER:
    case ActionTypes.DELETE_FRIEND:
    case ActionTypes.CANCEL_REQUEST:
    case ActionTypes.CREATE_NEW_USER: {
      return { ...state, loading: true, error: null };
    }

    case ActionTypes.CREATE_USER_SUCCESS: {
      const { user } = action.payload;

      return immer(state, draft => {
        draft.loading = false;
        draft.phoneNumber = user.phoneNumber;
        draft.users[user.phoneNumber] = user;

        return draft;
      });
    }

    case ActionTypes.FRIEND_USER_SUCCESS: {
      const { from, to } = action.payload;

      return immer(state, draft => {
        draft.users[from].requestedFriends.push(to);
        draft.users[to].friendRequests.push(from);
        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.ACCEPT_REQUEST_SUCCESS: {
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

    case ActionTypes.DENY_REQUEST_SUCCESS: {
      const { from, to } = action.payload;

      return immer(state, draft => {
        draft.users[to].requestedFriends = _.remove(
          draft.users[to].requestedFriends,
          from
        );
        draft.users[from].friendRequests = _.remove(
          draft.users[from].friendRequests,
          to
        );

        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.CANCEL_REQUEST_SUCCESS: {
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

    case ActionTypes.DELETE_FRIEND_SUCCESS: {
      const { from, to } = action.payload;

      return immer(state, draft => {
        draft.users[from].friends = _.remove(draft.users[from].friends, to);
        draft.users[to].friends = _.remove(draft.users[to].friends, from);

        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.LOAD_USERS: {
      const { users, complete = true } = action.payload;

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
  const userPhoneNumber = yield select(selectors.phoneNumber);

  try {
    const { phoneNumber } = action.payload;

    const endpoint = phoneNumber
      ? `/user/${phoneNumber}`
      : `/user/${userPhoneNumber}`;

    const res: AxiosResponse<User> = yield call(client.get, endpoint, {
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

  const newUser: User = {
    ...name,
    phoneNumber,
    notifications: [],
    friends: [],
    friendRequests: [],
    requestedFriends: [],
    deviceOS: Platform.OS,
    bio: "",
    timezone: "America/New_York"
  };

  if (phoneNumber === "0000000000") {
    yield all([
      yield put(Actions.createUserSuccess(newUser)),
      yield navigate("AUTHENTICATED")
    ]);
  } else
    try {
      const res: AxiosResponse<User> = yield client.put(
        "/user",
        { user: newUser },
        {
          headers: getHeaders({ jwt })
        }
      );

      const { data: createdUser } = res;

      yield all([
        yield put(Actions.createUserSuccess(createdUser)),
        yield navigate("AUTHENTICATED")
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
    const res: AxiosResponse<User> = yield client.patch(
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

    const res: AxiosResponse<User[]> = yield client.get(endpoint, {
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

    yield put(Actions.acceptRequestSuccess(phoneNumber, user.phoneNumber));
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

    yield put(Actions.denyRequestSuccess(phoneNumber, user.phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onCancelRequest(
  action: ExtractActionFromActionCreator<typeof Actions.denyRequest>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);

  try {
    const { user } = action.payload;

    const res = yield call(
      client.patch,
      `/user/${phoneNumber}/cancel/${user.phoneNumber}`,
      {},
      { headers: getHeaders({ jwt }) }
    );

    yield put(Actions.cancelRequestSuccess(phoneNumber, user.phoneNumber));
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

    yield put(Actions.friendSuccess(phoneNumber, user.phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onDeleteFriend(
  action: ExtractActionFromActionCreator<typeof Actions.friendUser>
) {
  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);
  const { user } = action.payload;

  try {
    yield call(
      client.patch,
      `user/${phoneNumber}/delete/${user.phoneNumber}`,
      {},
      {
        headers: getHeaders({ jwt })
      }
    );

    yield put(Actions.deleteFriendSuccess(phoneNumber, user.phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onStartup() {
  const jwt = yield select(selectors.jwt);
  const user = yield select(selectors.currentUser);

  if (jwt) {
    const timezone = moment.tz.guess(true);

    if (timezone !== user.timezone) yield put(Actions.updateUser({ timezone }));
  }
}

export function* userSagas() {
  yield all([
    yield takeLatest(REHYDRATE, onStartup),
    yield takeLatest(ActionTypes.FETCH_USER, onFetchUser),
    yield takeLatest(ActionTypes.FETCH_USERS, onFetchUsers),
    yield takeLatest(ActionTypes.CREATE_NEW_USER, onCreateUser),
    yield takeLatest(ActionTypes.UPDATE_USER, onUpdateUser),
    yield takeLatest(ActionTypes.FRIEND_USER, onFriendUser),
    yield takeEvery(ActionTypes.ACCEPT_REQUEST, onAcceptRequest),
    yield takeEvery(ActionTypes.DENY_REQUEST, onDenyRequest),
    yield takeEvery(ActionTypes.CANCEL_REQUEST, onCancelRequest),
    yield takeEvery(ActionTypes.DELETE_FRIEND, onDeleteFriend)
  ]);
}

export enum ActionTypes {
  CREATE_NEW_USER = "user/CREATE_NEW_USER",
  CREATE_USER_SUCCESS = "user/CREATE_USER_SUCCESS",
  FETCH_USER = "user/FETCH_USER",
  FETCH_USERS = "user/FETCH_USERS",
  UPDATE_USER = "user/UPDATE_USER",
  FRIEND_USER = "user/FRIEND_USER",
  FRIEND_USER_SUCCESS = "user/FRIEND_USER_SUCCESS",
  ACCEPT_REQUEST = "user/ACCEPT_REQUEST",
  ACCEPT_REQUEST_SUCCESS = "user/ACCEPT_REQUEST_SUCCESS",
  CANCEL_REQUEST = "user/CANCEL_REQUEST",
  CANCEL_REQUEST_SUCCESS = "user/CANCEL_REQUEST_SUCCESS",
  DENY_REQUEST = "user/DENY_REQUEST",
  DENY_REQUEST_SUCCESS = "user/DENY_REQUEST_SUCCESS",
  DELETE_FRIEND = "user/DELETE_FRIEND",
  DELETE_FRIEND_SUCCESS = "user/DELETE_FRIEND_SUCCESS",
  LOAD_USERS = "user/LOAD_USERS",
  ON_ERROR = "user/ERROR"
}

export const Actions = {
  fetchUser: (phoneNumber?: string) =>
    createAction(ActionTypes.FETCH_USER, { phoneNumber }),
  fetchUsers: (phoneNumbers: string[], selectOn?: string[]) =>
    createAction(ActionTypes.FETCH_USERS, { phoneNumbers, selectOn }),
  createUser: (name: { firstName: string; lastName: string }) =>
    createAction(ActionTypes.CREATE_NEW_USER, { name }),
  createUserSuccess: (user: User) =>
    createAction(ActionTypes.CREATE_USER_SUCCESS, { user }),
  loadUsers: (users: User[], complete?: boolean) =>
    createAction(ActionTypes.LOAD_USERS, { users, complete }),
  updateUser: (user: Partial<User>) =>
    createAction(ActionTypes.UPDATE_USER, { user }),

  /* adding friends, accepting friends, etc... */
  friendUser: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.FRIEND_USER, { user }),
  friendSuccess: (from: string, to: string) =>
    createAction(ActionTypes.FRIEND_USER_SUCCESS, { from, to }),
  acceptRequest: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.ACCEPT_REQUEST, { user }),
  acceptRequestSuccess: (from: string, to: string) =>
    createAction(ActionTypes.ACCEPT_REQUEST_SUCCESS, { from, to }),
  cancelRequest: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.CANCEL_REQUEST, { user }),
  cancelRequestSuccess: (from: string, to: string) =>
    createAction(ActionTypes.CANCEL_REQUEST_SUCCESS, { from, to }),
  denyRequest: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.DENY_REQUEST, { user }),
  denyRequestSuccess: (from: string, to: string) =>
    createAction(ActionTypes.DENY_REQUEST_SUCCESS, { from, to }),
  deleteFriend: (user: { phoneNumber: string }) =>
    createAction(ActionTypes.DELETE_FRIEND, { user }),
  deleteFriendSuccess: (from: string, to: string) =>
    createAction(ActionTypes.DELETE_FRIEND_SUCCESS, { from, to }),

  onError: (err: string) => createAction(ActionTypes.ON_ERROR, { err })
};
