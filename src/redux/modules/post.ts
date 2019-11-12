import immer from "immer";
import moment, { Moment } from "moment";
import {
  call,
  all,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest
} from "redux-saga/effects";
import { PostType } from "unexpected-cloud/models/post";
import uuid from "uuid/v4";

import client, { getHeaders } from "@api";
import { AxiosResponse } from "axios";
import Navigation from "../../Navigation";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";
import { Actions as ImageActions } from "./image";
import { TakePictureResponse } from "react-native-camera/types";

export interface FeedState {
  // frames: Array<{
  //   posts: PostType[];
  //   start: Date;
  //   end: Date;
  // }>;
  posts: PostType[];
  lastFetched: Date;
  stale: boolean;
}
export interface PostState {
  user: {
    posts: PostType[];
    lastFetched: Date;
    stale: boolean;
  };
  feed: FeedState;
  loading: boolean;
  error: string;
}

const initialState: PostState = {
  user: {
    posts: [],
    lastFetched: new Date(0),
    stale: true
  },
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
    case ActionTypes.SEND_POST || ActionTypes.FETCH_USERS_POSTS: {
      return immer(state, draft => {
        draft.loading = true;
        draft.error = "";
        return draft;
      });
    }

    case ActionTypes.SEND_POST_SUCCESS: {
      return immer(state, draft => {
        draft.loading = false;
        draft.user.stale = true;

        return draft;
      });
    }

    case ActionTypes.FETCH_USERS_POSTS_SUCCESS: {
      const { posts } = action.payload;
      return immer(state, draft => {
        draft.loading = false;
        draft.user = { posts, stale: false, lastFetched: new Date() };

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

    const body = new FormData();
    body.append("image", {
      uri,
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

    yield put(Actions.sendPostSuccess());
    yield Navigation.navigate("HOME");
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

function* onFetchUsersPosts() {
  try {
    const jwt = yield select(selectors.jwt);
    const phoneNumber = yield select(selectors.phoneNumber);

    const posts: AxiosResponse<PostType[]> = yield client.get(
      `/post/${phoneNumber}`,
      {
        headers: getHeaders({ jwt })
      }
    );

    yield put(Actions.fetchUsersPostsSuccess(posts.data));
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

    const res: AxiosResponse<PostType[]> = yield client.get(
      `post/${phoneNumber}/feed`,
      {
        headers: getHeaders({ jwt })
      }
    );

    const { data: posts } = res;

    yield put(Actions.fetchFeedSuccess(posts));

    // TODO: load the posts
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

export function* postSagas() {
  yield all([
    yield takeLatest(ActionTypes.SEND_POST, onSendPost),
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
  ON_ERROR = "post/ON_ERROR"
}

export const Actions = {
  fetchUsersPosts: () => createAction(ActionTypes.FETCH_USERS_POSTS),
  fetchUsersPostsSuccess: (posts: PostType[]) =>
    createAction(ActionTypes.FETCH_USERS_POSTS_SUCCESS, { posts }),
  fetchFeed: (fromDate?: Date) =>
    createAction(ActionTypes.FETCH_FEED, { fromDate }),
  fetchFeedSuccess: (posts: PostType[]) =>
    createAction(ActionTypes.FETCH_FEED_SUCCESS, { posts }),
  sendPost: (description: string) =>
    createAction(ActionTypes.SEND_POST, { description }),
  sendPostSuccess: () => createAction(ActionTypes.SEND_POST_SUCCESS),
  onError: (error: string) => createAction(ActionTypes.ON_ERROR, { error })
};
