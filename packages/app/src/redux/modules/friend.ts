import immer from "immer";
import _ from "lodash";
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { FriendRequest, FriendRequest_populated, PartialUser } from "@global";

import * as selectors from "../selectors";
import {
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
  FriendingState,
} from "../types";

type FriendMap = { [userId: string]: string[] };

export type FriendState = Readonly<{
  loading: boolean;
  fetchingFriends: boolean;
  friends: FriendMap;
  requested: string[];
  requests: string[];
  error: string;
}>;

const initialState: FriendState = {
  loading: false,
  fetchingFriends: false,
  friends: {},
  requested: [],
  requests: [],
  error: "",
};

export default (
  state: FriendState = initialState,
  action: ActionUnion
): FriendState => {
  switch (action.type) {
    case ActionTypes.FETCH_FRIENDS: {
      return { ...state, fetchingFriends: true };
    }

    case ActionTypes.FETCH_FRIENDS_SUCCESS: {
      const { id, users } = action.payload;

      return immer(state, (draft) => {
        draft.fetchingFriends = false;
        draft.friends[id] = users.map(({ id }) => id);
      });
    }

    case ActionTypes.FRIEND_USER_SUCCESS: {
      const { request } = action.payload;

      return immer(state, (draft) => {
        draft.requested.push(request.to as string);
        draft.loading = false;
      });
    }

    case ActionTypes.FETCH_USERS_REQUESTS_SUCCESS: {
      const { requestedFriends, friendRequests } = action.payload;

      return immer(state, (draft) => {
        draft.loading = false;

        draft.requests = friendRequests.map(({ from }) => from.id);
        draft.requested = requestedFriends.map(({ to }) => to.id);
      });
    }

    case ActionTypes.ACCEPT_REQUEST_SUCCESS: {
      const { userId, id } = action.payload;

      return immer(state, (draft) => {
        draft.friends[userId] = _.uniq([...(draft.friends[userId] ?? []), id]);
        draft.friends[id] = _.uniq([...(draft.friends[id] ?? []), userId]);

        draft.loading = false;
      });
    }

    case ActionTypes.DELETE_REQUEST_SUCCESS: {
      const { request } = action.payload;

      const { from, to } = request;

      return immer(state, (draft) => {
        draft.requested = draft.requested.filter((i) => i !== to);
        draft.requests = draft.requests.filter((i) => i !== from);

        draft.loading = false;
      });
    }

    case ActionTypes.DELETE_FRIEND_SUCCESS: {
      const { userId, id } = action.payload;

      return immer(state, (draft) => {
        draft.friends[userId] = _.uniq(
          (draft.friends[userId] ?? []).filter((i) => i !== id)
        );
        draft.friends[id] = _.uniq(
          (draft.friends[id] ?? []).filter((i) => i !== userId)
        );

        draft.loading = false;
      });
    }

    case ActionTypes.FRIEND_ERROR: {
      const { error } = action.payload;

      return {
        ...state,
        error,
        loading: false,
        fetchingFriends: false,
      };
    }

    default:
      return state;
  }
};

function* onFetchUsersRequests() {
  const jwt = yield select(selectors.jwt);

  try {
    const res = yield call(client.get, `/user/requests`, {
      headers: getHeaders({ jwt }),
    });

    const {
      data: { friendRequests, requestedFriends },
    } = res;

    yield put(
      Actions.fetchUsersRequestsSuccess(friendRequests, requestedFriends)
    );
  } catch (err) {
    yield put(Actions.onFriendError(err.message));
  }
}

function* onFriendUser(
  action: ExtractActionFromActionCreator<typeof Actions.friendUser>
) {
  const { id } = action.payload;

  const jwt = yield select(selectors.jwt);
  const userId = yield select(selectors.userId);

  try {
    const res = yield call(
      client.put,
      `friend/${id}`,
      {},
      {
        headers: getHeaders({ jwt }),
      }
    );

    const { data } = res;

    const { request } = data;

    if (request) {
      yield put(Actions.sendFriendRequestSuccess(request));
    } else {
      yield put(Actions.acceptRequestSuccess(userId, id));
    }
  } catch (err) {
    yield put(Actions.onFriendError(err));
  }
}

function* onDeleteFriend(
  action: ExtractActionFromActionCreator<typeof Actions.deleteFriend>
) {
  const { id } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const userId = yield select(selectors.userId);

    const res = yield call(client.delete, `friend/${id}`, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;

    const { request } = data;

    if (request) {
      yield put(Actions.deleteFriendRequestSuccess(request));
    } else {
      yield put(Actions.deleteFriendSuccess(userId, id));
    }
  } catch (err) {
    yield put(Actions.onFriendError(err));
  }
}

function* onFetchFriends(
  action: ExtractActionFromActionCreator<typeof Actions.fetchFriends>
) {
  const { id } = action.payload;

  const jwt = yield select(selectors.jwt);

  try {
    const { data }: { data: PartialUser[] } = yield call(
      client.get,
      `user/${id}/friends`,
      {
        headers: getHeaders({ jwt }),
      }
    );

    yield put(Actions.fetchFriendsSuccess(id, data));
  } catch (err) {
    yield put(Actions.onFriendError(err.message));
  }
}

export function* friendSagas() {
  yield all([
    yield takeLatest(ActionTypes.FETCH_FRIENDS, onFetchFriends),
    yield takeLatest(ActionTypes.FETCH_USERS_REQUESTS, onFetchUsersRequests),
    yield takeEvery(ActionTypes.FRIEND_USER, onFriendUser),
    yield takeEvery(ActionTypes.DELETE_FRIEND, onDeleteFriend),
  ]);
}

export const Actions = {
  fetchFriends: (id: string) => createAction(ActionTypes.FETCH_FRIENDS, { id }),
  fetchFriendsSuccess: (id: string, users: PartialUser[]) =>
    createAction(ActionTypes.FETCH_FRIENDS_SUCCESS, { id, users }),

  fetchUsersRequests: () => createAction(ActionTypes.FETCH_USERS_REQUESTS),
  fetchUsersRequestsSuccess: (
    friendRequests: FriendRequest_populated[],
    requestedFriends: FriendRequest_populated[]
  ) =>
    createAction(ActionTypes.FETCH_USERS_REQUESTS_SUCCESS, {
      friendRequests,
      requestedFriends,
    }),

  friendUser: (id: string) => createAction(ActionTypes.FRIEND_USER, { id }),
  sendFriendRequestSuccess: (request: FriendRequest) =>
    createAction(ActionTypes.FRIEND_USER_SUCCESS, { request }),
  acceptRequestSuccess: (userId: string, id: string) =>
    createAction(ActionTypes.ACCEPT_REQUEST_SUCCESS, { userId, id }),

  deleteFriend: (id: string) => createAction(ActionTypes.DELETE_FRIEND, { id }),
  deleteFriendSuccess: (userId: string, id: string) =>
    createAction(ActionTypes.DELETE_FRIEND_SUCCESS, { userId, id }),
  deleteFriendRequestSuccess: (request: FriendRequest) =>
    createAction(ActionTypes.DELETE_REQUEST_SUCCESS, { request }),

  onFriendError: (error: string) =>
    createAction(ActionTypes.FRIEND_ERROR, { error }),
};
