import { all, fork, put, select, take, takeLatest, takeEvery } from "redux-saga/effects";
import uuid from "uuid/v4";
import { PostType } from "unexpected-cloud/models/post";

import client, { getHeaders } from "@api";
import * as selectors from "../selectors";
import { Actions as ImageActions } from "./image";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";
import { AxiosResponse } from "axios";

export interface PostState {
  user: {
    posts: PostType[];
    stale: boolean;
  };
  loading: boolean;
  error: string;
}

const initialState: PostState = {
  user: {
    posts: [],
    stale: false
  },
  loading: false,
  error: ""
};

export type StarterActionTypes = ActionsUnion<typeof Actions>;
export default (state: PostState = initialState, action: StarterActionTypes): PostState => {
  switch (action.type) {
    case ActionTypes.SEND_POST || ActionTypes.FETCH_USERS_POSTS: {
      return { ...state, loading: true };
    }

    case ActionTypes.SEND_POST_SUCCESS: {
      return { ...state, loading: false, user: { ...state.user, stale: true } };
    }

    case ActionTypes.FETCH_USERS_POSTS_SUCCESS: {
      return { ...state, loading: false, user: { posts: action.payload.posts, stale: false } };
    }

    case ActionTypes.ON_ERROR: {
      return { ...state, loading: false, error: action.payload.error };
    }

    default:
      return state;
  }
};

function* onSendPost(action: ExtractActionFromActionCreator<typeof Actions.sendPost>) {
  const { description } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const phoneNumber = yield select(selectors.phoneNumber);
    const id = uuid();

    const post = {
      photoId: id,
      description
    };

    yield put(ImageActions.uploadPhoto(id));
    yield client.put(`/post/${phoneNumber}`, { post }, { headers: getHeaders({ jwt }) });
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onFetchUsersPosts() {
  try {
    const jwt = yield select(selectors.jwt);
    const phoneNumber = yield select(selectors.phoneNumber);

    const posts: AxiosResponse<PostType[]> = yield client.get(`/post/${phoneNumber}`, {
      headers: getHeaders({ jwt })
    });

    yield put(Actions.fetchUsersPostsSuccess(posts.data));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

export function* postSagas() {
  yield all([
    yield takeEvery(ActionTypes.SEND_POST, onSendPost),
    yield takeLatest(ActionTypes.FETCH_USERS_POSTS, onFetchUsersPosts)
  ]);
}

export enum ActionTypes {
  FETCH_USERS_POSTS = "post/FETCH_USERS_POSTS",
  FETCH_USERS_POSTS_SUCCESS = "post/FETCH_USERS_POSTS_SUCCESS",
  SEND_POST = "post/SEND_POST",
  SEND_POST_SUCCESS = "post/SEND_POST_SUCCESS",
  ON_ERROR = "post/ON_ERROR"
}

export const Actions = {
  fetchUsersPosts: () => createAction(ActionTypes.FETCH_USERS_POSTS),
  fetchUsersPostsSuccess: (posts: PostType[]) =>
    createAction(ActionTypes.FETCH_USERS_POSTS_SUCCESS, { posts }),
  sendPost: (description: string) => createAction(ActionTypes.SEND_POST, { description }),
  sendPostSuccess: () => createAction(ActionTypes.SEND_POST_SUCCESS),
  onError: (error: string) => createAction(ActionTypes.ON_ERROR, { error })
};
