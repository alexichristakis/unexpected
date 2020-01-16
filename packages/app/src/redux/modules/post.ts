import immer from "immer";
import { TakePictureResponse } from "react-native-camera/types";
import ImageResizer, {
  Response as ImageResizerResponse
} from "react-native-image-resizer";
import { all, call, put, select, takeLatest } from "redux-saga/effects";
import { FeedPost, Post } from "@unexpected/global";

import uuid from "uuid/v4";

import client, { getHeaders } from "@api";
import { AxiosResponse } from "axios";
import Navigation from "../../navigation";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";
import { Actions as AppActions } from "./app";

export interface FeedState {
  // frames: Array<{
  //   posts: Post[];
  //   start: Date;
  //   end: Date;
  // }>;
  posts: FeedPost[];
  lastFetched: Date;
  stale: boolean;
}
export interface PostState {
  users: {
    [phoneNumber: string]: {
      posts: Post[];
      lastFetched: Date;
      stale: boolean;
    };
  };
  feed: FeedState;
  loading: boolean;
  error: string;
}

const initialState: PostState = {
  users: {},
  feed: {
    // frames: [],
    posts: [],
    lastFetched: new Date(0),
    stale: true
  },
  loading: false,
  error: ""
};

export default (
  state: PostState = initialState,
  action: ActionsUnion<typeof Actions>
): PostState => {
  switch (action.type) {
    case ActionTypes.FETCH_FEED:
    case ActionTypes.FETCH_USERS_POSTS:
    case ActionTypes.DELETE_POST:
    case ActionTypes.SEND_POST: {
      return immer(state, draft => {
        draft.loading = true;
        draft.error = "";

        return draft;
      });
    }

    case ActionTypes.SEND_POST_SUCCESS: {
      const { phoneNumber } = action.payload;

      return immer(state, draft => {
        draft.loading = false;
        draft.users[phoneNumber].stale = true;

        return draft;
      });
    }

    case ActionTypes.FETCH_USERS_POSTS_SUCCESS: {
      const { phoneNumber, posts } = action.payload;

      return immer(state, draft => {
        draft.loading = false;
        draft.users[phoneNumber] = {
          posts,
          lastFetched: new Date(),
          stale: false
        };

        return draft;
      });
    }

    case ActionTypes.FETCH_FEED_SUCCESS: {
      const { posts } = action.payload;

      return immer(state, draft => {
        draft.loading = false;
        draft.feed = { posts, stale: false, lastFetched: new Date() };
      });
    }

    case ActionTypes.DELETE_POST_SUCCESS: {
      const { phoneNumber } = action.payload;
      return immer(state, draft => {
        draft.users[phoneNumber].stale = true;
        draft.feed.stale = true;

        return draft;
      });
    }

    case ActionTypes.ON_ERROR: {
      const { error } = action.payload;

      return immer(state, draft => {
        draft.error = error;
        draft.loading = false;

        return draft;
      });
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
    const phoneNumber = yield select(selectors.phoneNumber);
    const { uri, width, height }: TakePictureResponse = yield select(
      selectors.currentImage
    );
    const id = uuid();

    const post = {
      photoId: id,
      description
    };

    const image: ImageResizerResponse = yield ImageResizer.createResizedImage(
      uri,
      1000,
      1200,
      "JPEG",
      50
    );

    const body = new FormData();
    body.append("image", {
      // @ts-ignore
      uri: image.uri,
      height,
      width,
      type: "image/jpeg",
      name: `${phoneNumber}-${Date.now()}.jpg`
    });

    yield all([
      yield call(client.put, `/image/${phoneNumber}/${id}`, body, {
        headers: getHeaders({ jwt, image: true })
      }),
      yield call(
        client.put,
        `/post/${phoneNumber}`,
        { post },
        {
          headers: getHeaders({ jwt })
        }
      )
    ]);

    yield all([
      yield put(Actions.sendPostSuccess(phoneNumber)),
      yield put(AppActions.expireCamera()),
      yield Navigation.navigate("HOME")
    ]);
  } catch (err) {
    yield put(Actions.onError(err));
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
    const posts: AxiosResponse<Post[]> = yield client.get(
      `/post/${userFetched}`,
      {
        headers: getHeaders({ jwt })
      }
    );

    yield put(Actions.fetchUsersPostsSuccess(userFetched, posts.data));
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

function* onFetchFeed(
  action: ExtractActionFromActionCreator<typeof Actions.fetchFeed>
) {
  const { fromDate } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const phoneNumber = yield select(selectors.phoneNumber);
    const feedState: FeedState = yield select(selectors.feedState);

    const from = fromDate ? fromDate : feedState.lastFetched;

    const res = yield client.get(`post/${phoneNumber}/feed`, {
      headers: getHeaders({ jwt })
    });

    const { data: posts } = res;

    yield put(Actions.fetchFeedSuccess(posts));
  } catch (err) {
    yield put(Actions.onError(err.message));
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
      headers: getHeaders({ jwt })
    });

    yield put(Actions.deletePostSuccess(phoneNumber));
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

export function* postSagas() {
  yield all([
    yield takeLatest(ActionTypes.SEND_POST, onSendPost),
    yield takeLatest(ActionTypes.DELETE_POST, onDeletePost),
    yield takeLatest(ActionTypes.FETCH_USERS_POSTS, onFetchUsersPosts),
    yield takeLatest(ActionTypes.FETCH_FEED, onFetchFeed)
  ]);
}

export enum ActionTypes {
  FETCH_USERS_POSTS = "post/FETCH_USERS_POSTS",
  FETCH_USERS_POSTS_SUCCESS = "post/FETCH_USERS_POSTS_SUCCESS",
  FETCH_FEED = "post/FETCH_FEED",
  FETCH_FEED_SUCCESS = "post/FETCH_FEED_SUCCESS",
  SEND_POST = "post/SEND_POST",
  SEND_POST_SUCCESS = "post/SEND_POST_SUCCESS",
  DELETE_POST = "post/DELETE",
  DELETE_POST_SUCCESS = "post/DELETE_SUCCESS",
  ON_ERROR = "post/ERROR"
}

export const Actions = {
  fetchUsersPosts: (phoneNumber?: string) =>
    createAction(ActionTypes.FETCH_USERS_POSTS, { phoneNumber }),
  fetchUsersPostsSuccess: (phoneNumber: string, posts: Post[]) =>
    createAction(ActionTypes.FETCH_USERS_POSTS_SUCCESS, { phoneNumber, posts }),
  fetchFeed: (fromDate?: Date) =>
    createAction(ActionTypes.FETCH_FEED, { fromDate }),
  fetchFeedSuccess: (posts: FeedPost[]) =>
    createAction(ActionTypes.FETCH_FEED_SUCCESS, { posts }),

  sendPost: (description: string) =>
    createAction(ActionTypes.SEND_POST, { description }),
  sendPostSuccess: (phoneNumber: string) =>
    createAction(ActionTypes.SEND_POST_SUCCESS, { phoneNumber }),

  deletePost: (id: string) => createAction(ActionTypes.DELETE_POST, { id }),
  deletePostSuccess: (phoneNumber: string) =>
    createAction(ActionTypes.DELETE_POST_SUCCESS, { phoneNumber }),

  onError: (error: string) => createAction(ActionTypes.ON_ERROR, { error })
};
