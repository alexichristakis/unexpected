import { Platform } from "react-native";

import { AxiosResponse } from "axios";
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
import { User, FriendRequest } from "@unexpected/global";

import client, { getHeaders } from "@api";

import { navigate } from "../../navigation";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";

export interface UserState {
  phoneNumber: string;
  friendRequests: FriendRequest[];
  requestedFriends: FriendRequest[];
  users: { [phoneNumber: string]: User };
  stale: boolean;
  loading: boolean;
  error: any;
}

const initialState: UserState = {
  phoneNumber: "",
  friendRequests: [],
  requestedFriends: [],
  users: {},
  stale: false,
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
    case ActionTypes.FETCH_USERS_REQUESTS:
    case ActionTypes.ACCEPT_REQUEST:
    case ActionTypes.FRIEND_USER:
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
      const { request } = action.payload;

      return immer(state, draft => {
        draft.requestedFriends.push(request);
        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.FETCH_USERS_REQUESTS_SUCCESS: {
      const { requestedFriends, friendRequests } = action.payload;

      return immer(state, draft => {
        draft.loading = false;

        draft.friendRequests = friendRequests;
        draft.requestedFriends = requestedFriends;

        return draft;
      });
    }

    case ActionTypes.ACCEPT_REQUEST_SUCCESS: {
      const { phoneNumber, to } = action.payload;

      return immer(state, draft => {
        draft.requestedFriends = _.remove(
          draft.friendRequests,
          request => request.from === to
        );

        draft.users[phoneNumber].friends.push(to);
        draft.users[to].friends.push(phoneNumber);

        draft.loading = false;
        draft.stale = true;

        return draft;
      });
    }

    case ActionTypes.DELETE_FRIEND_SUCCESS: {
      const { phoneNumber, to } = action.payload;

      return immer(state, draft => {
        draft.users[phoneNumber].friends = _.remove(
          draft.users[phoneNumber].friends,
          to
        );
        draft.users[to].friends = _.remove(
          draft.users[to].friends,
          phoneNumber
        );

        draft.loading = false;
        draft.stale = true;

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
    yield put(Actions.loadUsers([data]));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onFetchUsersRequests() {
  const phoneNumber = yield select(selectors.phoneNumber);
  const jwt = yield select(selectors.jwt);

  try {
    const res = yield client.get(`/user/${phoneNumber}/requests`, {
      headers: getHeaders({ jwt })
    });

    const {
      data: { friendRequests, requestedFriends }
    } = res;

    yield put(
      Actions.fetchUsersRequestsSuccess(friendRequests, requestedFriends)
    );
  } catch (err) {
    yield put(Actions.onError(err.message));
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
    const { phoneNumber: from } = action.payload;

    const res = yield call(
      client.patch,
      `/user/${from}/accept/${phoneNumber}`,
      {},
      { headers: getHeaders({ jwt }) }
    );

    yield put(Actions.acceptRequestSuccess(from, phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onFriendUser(
  action: ExtractActionFromActionCreator<typeof Actions.friendUser>
) {
  const { phoneNumber: to } = action.payload;

  const jwt = yield select(selectors.jwt);
  const phoneNumber = yield select(selectors.phoneNumber);

  try {
    const res = yield client.patch(
      `user/${phoneNumber}/friend/${to}`,
      {},
      {
        headers: getHeaders({ jwt })
      }
    );

    const { data } = res;

    yield put(Actions.friendUserSuccess(data));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onDeleteFriend(
  action: ExtractActionFromActionCreator<typeof Actions.deleteFriend>
) {
  const { phoneNumber: to } = action.payload;

  try {
    const phoneNumber = yield select(selectors.phoneNumber);
    const jwt = yield select(selectors.jwt);

    const res = yield client.patch(
      `user/${phoneNumber}/delete/${to}`,
      {},
      {
        headers: getHeaders({ jwt })
      }
    );

    yield put(Actions.deleteFriendSuccess(phoneNumber, to));
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
    yield takeLatest(ActionTypes.FETCH_USERS_REQUESTS, onFetchUsersRequests),
    yield takeLatest(ActionTypes.CREATE_NEW_USER, onCreateUser),
    yield takeLatest(ActionTypes.UPDATE_USER, onUpdateUser),
    yield takeEvery(ActionTypes.FRIEND_USER, onFriendUser),
    yield takeEvery(ActionTypes.DELETE_FRIEND, onDeleteFriend),
    yield takeEvery(ActionTypes.ACCEPT_REQUEST, onAcceptRequest)
  ]);
}

export enum ActionTypes {
  CREATE_NEW_USER = "user/CREATE_NEW_USER",
  CREATE_USER_SUCCESS = "user/CREATE_USER_SUCCESS",
  FETCH_USER = "user/FETCH_USER",
  FETCH_USERS = "user/FETCH_USERS",
  FETCH_USERS_REQUESTS = "user/FETCH_USERS_REQUESTS",
  FETCH_USERS_REQUESTS_SUCCESS = "user/FETCH_USERS_REQUESTS_SUCCESS",
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
  fetchUsersRequests: () => createAction(ActionTypes.FETCH_USERS_REQUESTS),
  fetchUsersRequestsSuccess: (
    friendRequests: FriendRequest[],
    requestedFriends: FriendRequest[]
  ) =>
    createAction(ActionTypes.FETCH_USERS_REQUESTS_SUCCESS, {
      friendRequests,
      requestedFriends
    }),
  createUser: (name: { firstName: string; lastName: string }) =>
    createAction(ActionTypes.CREATE_NEW_USER, { name }),
  createUserSuccess: (user: User) =>
    createAction(ActionTypes.CREATE_USER_SUCCESS, { user }),
  loadUsers: (users: User[]) => createAction(ActionTypes.LOAD_USERS, { users }),
  updateUser: (user: Partial<User>) =>
    createAction(ActionTypes.UPDATE_USER, { user }),

  friendUser: (phoneNumber: string) =>
    createAction(ActionTypes.FRIEND_USER, { phoneNumber }),
  friendUserSuccess: (request: FriendRequest) =>
    createAction(ActionTypes.FRIEND_USER_SUCCESS, { request }),

  deleteFriend: (phoneNumber: string) =>
    createAction(ActionTypes.DELETE_FRIEND, { phoneNumber }),
  deleteFriendSuccess: (phoneNumber: string, to: string) =>
    createAction(ActionTypes.DELETE_FRIEND_SUCCESS, { phoneNumber, to }),

  acceptRequest: (phoneNumber: string) =>
    createAction(ActionTypes.ACCEPT_REQUEST, { phoneNumber }),
  acceptRequestSuccess: (phoneNumber: string, to: string) =>
    createAction(ActionTypes.ACCEPT_REQUEST_SUCCESS, { phoneNumber, to }),

  // cancelRequest: (phoneNumber: string) =>
  //   createAction(ActionTypes.CANCEL_REQUEST, { phoneNumber }),
  // cancelRequestSuccess: (phoneNumber: string) =>
  //   createAction(ActionTypes.CANCEL_REQUEST_SUCCESS, { phoneNumber }),
  // denyRequest: (phoneNumber: string) =>
  //   createAction(ActionTypes.DENY_REQUEST, { phoneNumber }),
  // denyRequestSuccess: (phoneNumber: string) =>
  //   createAction(ActionTypes.DENY_REQUEST_SUCCESS, { phoneNumber }),
  // deleteFriend: (phoneNumber: string) =>
  //   createAction(ActionTypes.DELETE_FRIEND, { phoneNumber }),
  // deleteFriendSuccess: (phoneNumber: string) =>
  //   createAction(ActionTypes.DELETE_FRIEND_SUCCESS, { phoneNumber }),

  /*

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
    */

  onError: (err: string) => createAction(ActionTypes.ON_ERROR, { err })
};
