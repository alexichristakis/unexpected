import immer from "immer";
import _ from "lodash";
import keyBy from "lodash/keyBy";
import moment from "moment";
import { TakePictureResponse } from "react-native-camera/types";
import ImageResizer, {
  Response as ImageResizerResponse,
} from "react-native-image-resizer";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { all, call, put, select, takeLatest } from "redux-saga/effects";
import uuid from "uuid/v4";

import { Comment, User, Post, NewComment, Post_populated } from "@global";
import client, { getHeaders } from "@api";

import * as selectors from "../selectors";
import {
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";
import { Actions as AppActions } from "./app";
import { Actions as UserActions } from "./user";

import { StackParamList } from "../../App";
import { AxiosResponse } from "axios";

type PostMap = {
  [postId: string]: Post;
};

export interface PostState {
  posts: PostMap;
  feed: {
    posts: string[];
    lastFetched: number;
    stale: boolean;
    loading: boolean;
  };
  loading: boolean;
  error: string;
}

const initialState: PostState = {
  posts: {},
  feed: {
    posts: [],
    lastFetched: -1,
    stale: true,
    loading: false,
  },
  loading: false,
  error: "",
};

export default (
  state: PostState = initialState,
  action: ActionUnion
): PostState => {
  switch (action.type) {
    case ActionTypes.FETCH_FEED: {
      return immer(state, (draft) => {
        draft.feed.loading = true;
        draft.error = "";
      });
    }

    case ActionTypes.FETCH_FEED_SUCCESS: {
      const { posts } = action.payload;

      return immer(state, (draft) => {
        const lastFetched = moment().unix();

        draft.feed = {
          loading: false,
          posts: Object.keys(posts),
          stale: false,
          lastFetched,
        };

        draft.posts = posts;
      });
    }

    case ActionTypes.FETCH_POST_SUCCESS: {
      const { post } = action.payload;

      return immer(state, (draft) => {
        draft.posts[post.id] = post;
      });
    }

    case ActionTypes.FETCH_USERS_POSTS:
    case ActionTypes.DELETE_POST:
    case ActionTypes.SEND_POST: {
      return immer(state, (draft) => {
        draft.loading = true;
        draft.feed.stale = true;

        draft.error = "";
      });
    }

    case ActionTypes.DELETE_POST_SUCCESS:
    case ActionTypes.SEND_POST_SUCCESS: {
      return immer(state, (draft) => {
        draft.loading = false;
        draft.feed.stale = true;
      });
    }

    case ActionTypes.FETCH_USERS_POSTS_SUCCESS: {
      const { posts } = action.payload;

      return immer(state, (draft) => {
        draft.loading = false;

        draft.posts = _.merge(draft.posts, posts);
      });
    }

    case ActionTypes.POST_ERROR: {
      const { error } = action.payload;

      return immer(state, (draft) => {
        draft.error = error;
        draft.loading = false;
        draft.feed.loading = false;
      });
    }

    default:
      return state;
  }
};

function* onSendPost(
  action: ExtractActionFromActionCreator<typeof Actions.sendPost>
) {
  const { description, navigation } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const phoneNumber = yield select(selectors.phoneNumber);
    const { uri, width, height }: TakePictureResponse = yield select(
      selectors.currentImage
    );
    const id = uuid();

    const post = {
      photoId: id,
      description,
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
      name: `${phoneNumber}-${Date.now()}.jpg`,
    });

    yield all([
      yield call(client.put, `/image/${phoneNumber}/${id}`, body, {
        headers: getHeaders({ jwt, image: true }),
      }),
      yield call(
        client.put,
        `/post/${phoneNumber}`,
        { post },
        {
          headers: getHeaders({ jwt }),
        }
      ),
    ]);

    yield all([
      yield put(Actions.sendPostSuccess(phoneNumber)),
      yield put(AppActions.expireCamera()),
    ]);

    navigation.navigate("HOME");
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

  console.log("fetching feed");
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

    // yield put(Actions.fetchFeedSuccess(posts));
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

  sendPost: (
    description: string,
    navigation: NativeStackNavigationProp<StackParamList>
  ) => createAction(ActionTypes.SEND_POST, { description, navigation }),
  sendPostSuccess: (phoneNumber: string) =>
    createAction(ActionTypes.SEND_POST_SUCCESS, { phoneNumber }),

  deletePost: (id: string) => createAction(ActionTypes.DELETE_POST, { id }),
  deletePostSuccess: (phoneNumber: string) =>
    createAction(ActionTypes.DELETE_POST_SUCCESS, { phoneNumber }),

  onPostError: (error: string) =>
    createAction(ActionTypes.POST_ERROR, { error }),
};
