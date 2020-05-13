import immer from "immer";
import _ from "lodash";
import moment from "moment";
import { TakePictureResponse } from "react-native-camera/types";
import ImageResizer, {
  Response as ImageResizerResponse,
} from "react-native-image-resizer";
import { all, call, put, select, takeLatest } from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { Comment, Post, User } from "@global";

import * as selectors from "../selectors";
import {
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";

type PostMap = {
  [postId: string]: Post;
};

export interface PostState {
  posts: PostMap;
  loadingPost: boolean;
  loadingUsersPosts: boolean;
  loadingFeed: boolean;
  error: string;
}

const initialState: PostState = {
  posts: {},
  loadingPost: false,
  loadingUsersPosts: false,
  loadingFeed: false,
  error: "",
};

export default (
  state: PostState = initialState,
  action: ActionUnion
): PostState => {
  switch (action.type) {
    case ActionTypes.FETCH_FEED: {
      return {
        ...state,
        loadingFeed: true,
        error: "",
      };
    }

    case ActionTypes.FETCH_FEED_SUCCESS: {
      const { posts } = action.payload;

      return {
        ...state,
        posts,
        loadingFeed: false,
        loadingPost: false,
        loadingUsersPosts: false,
      };
    }

    case ActionTypes.FETCH_POST_SUCCESS: {
      const { post } = action.payload;

      return immer(state, (draft) => {
        draft.posts[post.id] = post;
      });
    }

    case ActionTypes.FETCH_USERS_POSTS: {
      return {
        ...state,
        loadingUsersPosts: true,
      };
    }

    case ActionTypes.DELETE_POST:
    case ActionTypes.SEND_POST: {
      return {
        ...state,
        loadingPost: true,
        error: "",
      };
    }

    case ActionTypes.DELETE_POST_SUCCESS:
    case ActionTypes.SEND_POST_SUCCESS: {
      return {
        ...state,
        loadingPost: false,
      };
    }

    case ActionTypes.FETCH_USERS_POSTS_SUCCESS: {
      const { posts } = action.payload;

      return {
        ...state,
        loadingUsersPosts: false,
        posts: _.merge(state.posts, posts),
      };
    }

    case ActionTypes.POST_ERROR: {
      const { error } = action.payload;

      return {
        ...state,
        error,
        loadingFeed: false,
        loadingPost: false,
        loadingUsersPosts: false,
      };
    }

    default:
      return state;
  }
};

function* onSendPost(
  action: ExtractActionFromActionCreator<typeof Actions.sendPost>
) {
  const { description } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const userId = yield select(selectors.userId);
    const image: TakePictureResponse = yield select(selectors.currentImage);

    const {
      uri,
      width,
      height,
    }: ImageResizerResponse = yield ImageResizer.createResizedImage(
      image.uri,
      500,
      600,
      "JPEG",
      50
    );

    const body = new FormData();

    body.append("image", {
      // @ts-ignore
      uri,
      width,
      height,
      name: `${moment().toISOString()}.jpg`,
      type: "image/jpeg",
    });

    body.append("description", description);

    yield call(client.put, `/post/${userId}`, body, {
      headers: getHeaders({ jwt, image: true }),
    });

    yield put(Actions.postSuccess());
  } catch (err) {
    yield put(Actions.onPostError(err));
  }
}

function* onFetchUsersPosts(
  action: ExtractActionFromActionCreator<typeof Actions.fetchUsersPosts>
) {
  const { phoneNumber } = action.payload;
  try {
    const jwt = yield select(selectors.jwt);
    const userPhoneNumber = yield select(selectors.phoneNumber);

    // default to fetching authenticated user's feed
    const userFetched = phoneNumber ? phoneNumber : userPhoneNumber;

    const res = yield client.get(`/post/${userFetched}/posts`, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;

    yield put(Actions.fetchUsersPostsSuccess(data));
  } catch (err) {
    yield put(Actions.onPostError(err.message));
  }
}

function* onFetchFeed(
  action: ExtractActionFromActionCreator<typeof Actions.fetchFeed>
) {
  // const { fromDate } = action.payload;
  try {
    const jwt = yield select(selectors.jwt);
    const userId = yield select(selectors.userId);
    // const feedState: FeedState = yield select(selectors.feedState);

    // const from = fromDate ? fromDate : feedState.lastFetched;

    const res = yield client.get(`post/${userId}/feed`, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;
    if (data) {
      const { posts, users } = data;

      yield put(Actions.fetchFeedSuccess(posts, users));
    }

    yield put(Actions.onPostError("error fetching feed"));
  } catch (err) {
    yield put(Actions.onPostError(err.message));
  }
}

function* onFetchPost(
  action: ExtractActionFromActionCreator<typeof Actions.fetchPost>
) {
  const { id } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);

    const res = yield client.get(`post/${id}`, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;

    const { post, comments } = data;

    yield put(Actions.fetchPostSuccess(post, comments));
  } catch (err) {
    yield put(Actions.onPostError(err.message));
  }
}

function* onDeletePost(
  action: ExtractActionFromActionCreator<typeof Actions.deletePost>
) {
  const { id } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const phoneNumber = yield select(selectors.phoneNumber);

    const res = yield client.delete(`post/${id}`, {
      headers: getHeaders({ jwt }),
    });

    yield put(Actions.deletePostSuccess(phoneNumber));
  } catch (err) {
    yield put(Actions.onPostError(err.message));
  }
}

export function* postSagas() {
  yield all([
    yield takeLatest(ActionTypes.SEND_POST, onSendPost),
    yield takeLatest(ActionTypes.DELETE_POST, onDeletePost),
    yield takeLatest(ActionTypes.FETCH_USERS_POSTS, onFetchUsersPosts),
    yield takeLatest(ActionTypes.FETCH_FEED, onFetchFeed),
    yield takeLatest(ActionTypes.FETCH_POST, onFetchPost),
  ]);
}

export const Actions = {
  fetchUsersPosts: (phoneNumber?: string) =>
    createAction(ActionTypes.FETCH_USERS_POSTS, { phoneNumber }),
  fetchUsersPostsSuccess: (posts: PostMap) =>
    createAction(ActionTypes.FETCH_USERS_POSTS_SUCCESS, { posts }),

  fetchFeed: (fromDate?: Date) =>
    createAction(ActionTypes.FETCH_FEED, { fromDate }),
  fetchFeedSuccess: (posts: PostMap, users: User[]) =>
    createAction(ActionTypes.FETCH_FEED_SUCCESS, {
      posts,
      users,
    }),

  fetchPost: (id: string) => createAction(ActionTypes.FETCH_POST, { id }),
  fetchPostSuccess: (post: Post, comments: Comment[]) =>
    createAction(ActionTypes.FETCH_POST_SUCCESS, { post, comments }),

  sendPost: (description: string) =>
    createAction(ActionTypes.SEND_POST, { description }),
  postSuccess: () => createAction(ActionTypes.SEND_POST_SUCCESS),

  deletePost: (id: string) => createAction(ActionTypes.DELETE_POST, { id }),
  deletePostSuccess: (phoneNumber: string) =>
    createAction(ActionTypes.DELETE_POST_SUCCESS, { phoneNumber }),

  onPostError: (error: string) =>
    createAction(ActionTypes.POST_ERROR, { error }),
};
