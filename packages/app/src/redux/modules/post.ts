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

import { Comment, User, Post, NewComment } from "@global";
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

type FeedEndpointReturn = {
  postIds: string[];
  posts: PostMap;
  users: { [id: string]: User };
  comments: { [postId: string]: Comment[] };
};

type UserMap = {
  [phoneNumber: string]: {
    posts: string[];
    lastFetched: string;
  };
};

type PostMap = {
  [postId: string]: Post;
};

type CommentMap = {
  [postId: string]: { [commentId: string]: Comment };
};

export interface PostState {
  users: UserMap;
  posts: PostMap;
  comments: CommentMap;
  feed: {
    posts: string[];
    lastFetched: string;
    stale: boolean;
    loading: boolean;
  };
  loading: boolean;
  commentsLoading: boolean;
  loadingPosts: { [phoneNumber: string]: boolean };
  error: string;
}

const initialState: PostState = {
  users: {},
  posts: {},
  comments: {},
  feed: {
    posts: [],
    lastFetched: "",
    stale: true,
    loading: false,
  },
  loading: false,
  commentsLoading: false,
  loadingPosts: {},
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

    case ActionTypes.FETCH_POST:
    case ActionTypes.FETCH_COMMENTS:
    case ActionTypes.SEND_COMMENT:
    case ActionTypes.DELETE_COMMENT: {
      return immer(state, (draft) => {
        draft.commentsLoading = true;
      });
    }

    case ActionTypes.FETCH_FEED_SUCCESS: {
      const { postIds, posts, users, comments } = action.payload;

      return immer(state, (draft) => {
        draft.feed = {
          loading: false,
          posts: postIds,
          stale: false,
          lastFetched: moment().toISOString(),
        };

        draft.users = users;
        draft.comments = comments;
        draft.posts = posts;
      });
    }

    case ActionTypes.FETCH_POST_SUCCESS: {
      const { post, comments } = action.payload;

      return immer(state, (draft) => {
        draft.commentsLoading = false;

        draft.comments[post.id] = keyBy(comments, ({ id }) => id);
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
      const { phoneNumber, postIds, posts } = action.payload;

      return immer(state, (draft) => {
        draft.loading = false;
        draft.users[phoneNumber] = {
          posts: postIds,
          lastFetched: moment().toISOString(),
        };

        draft.posts = _.merge(draft.posts, posts);
      });
    }

    case ActionTypes.POST_ERROR: {
      const { error } = action.payload;

      return immer(state, (draft) => {
        draft.error = error;
        draft.loading = false;
        draft.commentsLoading = false;
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

    const postIds = Object.keys(data);

    yield put(Actions.fetchUsersPostsSuccess(userFetched, postIds, data));
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
    const phoneNumber = yield select(selectors.phoneNumber);
    // const feedState: FeedState = yield select(selectors.feedState);

    // const from = fromDate ? fromDate : feedState.lastFetched;

    const res = yield client.get(`post/${phoneNumber}/feed`, {
      headers: getHeaders({ jwt }),
    });

    const { data }: { data: FeedEndpointReturn } = res;
    if (data) {
      const { postIds, posts, users, comments } = data;

      const postsByUser = _.groupBy(posts, ({ user }) => user);

      const userMap = Object.keys(users).reduce((acc, curr) => {
        acc[curr] = {
          posts: postsByUser[curr]?.map(({ id }) => id),
          lastFetched: moment().toISOString(),
        };

        return acc;
      }, {} as UserMap);

      const commentMap: CommentMap = {};
      Object.keys(comments).map(
        (key) => (commentMap[key] = keyBy(comments[key], ({ id }) => id))
      );

      const userValues = Object.values(users);
      yield all([
        yield put(UserActions.loadUsers(userValues)),
        yield put(
          Actions.fetchFeedSuccess(postIds, posts, userMap, commentMap)
        ),
      ]);
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
  fetchUsersPostsSuccess: (
    phoneNumber: string,
    postIds: string[],
    posts: PostMap
  ) =>
    createAction(ActionTypes.FETCH_USERS_POSTS_SUCCESS, {
      phoneNumber,
      postIds,
      posts,
    }),

  fetchFeed: (fromDate?: Date) =>
    createAction(ActionTypes.FETCH_FEED, { fromDate }),
  fetchFeedSuccess: (
    postIds: string[],
    posts: PostMap,
    users: UserMap,
    comments: CommentMap
  ) =>
    createAction(ActionTypes.FETCH_FEED_SUCCESS, {
      postIds,
      posts,
      users,
      comments,
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
