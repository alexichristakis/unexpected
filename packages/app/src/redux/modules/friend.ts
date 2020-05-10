import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import immer from "immer";
import _ from "lodash";

import client, { getHeaders } from "@api";
import { FriendRequest, FriendRequest_populated } from "@global";

import {
  ActionUnion,
  ActionTypes,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";
import * as selectors from "../selectors";

type FriendMap = { [userId: string]: string[] };

export type FriendState = Readonly<{
  loading: boolean;
  friends: FriendMap;
  requested: string[];
  requests: string[];
}>;

const initialState: FriendState = {
  loading: false,
  friends: {},
  requested: [],
  requests: [],
};

export default (
  state: FriendState = initialState,
  action: ActionUnion
): FriendState => {
  switch (action.type) {
    case ActionTypes.FRIEND_USER_SUCCESS: {
      const { request } = action.payload;

      return immer(state, (draft) => {
        draft.requested.push(request.to as string);
        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.FETCH_USERS_REQUESTS_SUCCESS: {
      const { requestedFriends, friendRequests } = action.payload;

      return immer(state, (draft) => {
        draft.loading = false;

        draft.requests = friendRequests.map(({ from }) => from.id);
        draft.requested = requestedFriends.map(({ to }) => to.id);

        return draft;
      });
    }

    case ActionTypes.ACCEPT_REQUEST_SUCCESS: {
      const { from, to } = action.payload;

      return immer(state, (draft) => {
        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.DELETE_FRIEND_SUCCESS: {
      const { from, to } = action.payload;

      return immer(state, (draft) => {
        draft.loading = false;

        return draft;
      });
    }

    case ActionTypes.CANCEL_REQUEST_SUCCESS: {
      const { id } = action.payload;

      return immer(state, (draft) => {
        return draft;
      });
    }

    case ActionTypes.DENY_REQUEST_SUCCESS: {
      const { id } = action.payload;

      return immer(state, (draft) => {
        return draft;
      });
    }

    default:
      return state;
  }
};

function* onFetchUsersRequests() {
  const phoneNumber = yield select(selectors.phoneNumber);
  const jwt = yield select(selectors.jwt);

  try {
    const res = yield client.get(`/user/${phoneNumber}/requests`, {
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
    yield put(Actions.onFriendError(err));
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
        headers: getHeaders({ jwt }),
      }
    );

    const { data } = res;

    yield put(Actions.friendUserSuccess(data));
  } catch (err) {
    yield put(Actions.onFriendError(err));
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
        headers: getHeaders({ jwt }),
      }
    );

    yield put(Actions.deleteFriendSuccess(phoneNumber, to));
  } catch (err) {
    yield put(Actions.onFriendError(err));
  }
}

function* onDenyRequest(
  action: ExtractActionFromActionCreator<typeof Actions.denyRequest>
) {
  const { phoneNumber: from } = action.payload;

  const friendRequests: FriendRequest[] = yield select(selectors.requests);
  const jwt = yield select(selectors.jwt);

  try {
    const id = friendRequests.find((r) => r.from === from)?.id;

    if (id) {
      const res = yield client.delete(`user/request/${id}`, {
        headers: getHeaders({ jwt }),
      });

      yield put(Actions.denyRequestSuccess(id));
    }
  } catch (err) {
    yield put(Actions.onFriendError(err.message));
  }
}

function* onCancelRequest(
  action: ExtractActionFromActionCreator<typeof Actions.cancelRequest>
) {
  const { phoneNumber: to } = action.payload;

  const requestedFriends: FriendRequest[] = yield select(selectors.requested);

  const jwt = yield select(selectors.jwt);

  try {
    const id = requestedFriends.find((r) => r.to === to)?.id;

    if (id) {
      const res = yield client.delete(`user/request/${id}`, {
        headers: getHeaders({ jwt }),
      });

      yield put(Actions.cancelRequestSuccess(id));
    }
  } catch (err) {
    yield put(Actions.onFriendError(err.message));
  }
}

export function* friendSagas() {
  yield all([
    yield takeLatest(ActionTypes.FETCH_USERS_REQUESTS, onFetchUsersRequests),
    yield takeEvery(ActionTypes.FRIEND_USER, onFriendUser),
    yield takeEvery(ActionTypes.DELETE_FRIEND, onDeleteFriend),
    yield takeEvery(ActionTypes.ACCEPT_REQUEST, onAcceptRequest),
    yield takeEvery(ActionTypes.DENY_REQUEST, onDenyRequest),
    yield takeEvery(ActionTypes.CANCEL_REQUEST, onCancelRequest),
  ]);
}

export const Actions = {
  fetchUsersRequests: () => createAction(ActionTypes.FETCH_USERS_REQUESTS),
  fetchUsersRequestsSuccess: (
    friendRequests: FriendRequest_populated[],
    requestedFriends: FriendRequest_populated[]
  ) =>
    createAction(ActionTypes.FETCH_USERS_REQUESTS_SUCCESS, {
      friendRequests,
      requestedFriends,
    }),

  friendUser: (phoneNumber: string) =>
    createAction(ActionTypes.FRIEND_USER, { phoneNumber }),
  friendUserSuccess: (request: FriendRequest) =>
    createAction(ActionTypes.FRIEND_USER_SUCCESS, { request }),

  deleteFriend: (phoneNumber: string) =>
    createAction(ActionTypes.DELETE_FRIEND, { phoneNumber }),
  deleteFriendSuccess: (from: string, to: string) =>
    createAction(ActionTypes.DELETE_FRIEND_SUCCESS, { from, to }),

  acceptRequest: (phoneNumber: string) =>
    createAction(ActionTypes.ACCEPT_REQUEST, { phoneNumber }),
  acceptRequestSuccess: (from: string, to: string) =>
    createAction(ActionTypes.ACCEPT_REQUEST_SUCCESS, { from, to }),

  cancelRequest: (phoneNumber: string) =>
    createAction(ActionTypes.CANCEL_REQUEST, { phoneNumber }),
  cancelRequestSuccess: (id: string) =>
    createAction(ActionTypes.CANCEL_REQUEST_SUCCESS, { id }),

  denyRequest: (phoneNumber: string) =>
    createAction(ActionTypes.DENY_REQUEST, { phoneNumber }),
  denyRequestSuccess: (id: string) =>
    createAction(ActionTypes.DENY_REQUEST_SUCCESS, { id }),

  onFriendError: (error: string) =>
    createAction(ActionTypes.FRIEND_ERROR, { error }),
};
