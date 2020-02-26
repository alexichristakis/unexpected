import { Comment, NewComment, Post, User } from "@unexpected/global";
import immer from "immer";
import _ from "lodash";
import includes from "lodash/includes";
import keyBy from "lodash/keyBy";
import uniqBy from "lodash/uniqBy";
import moment from "moment";
import { TakePictureResponse } from "react-native-camera/types";
import ImageResizer, {
  Response as ImageResizerResponse
} from "react-native-image-resizer";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { all, call, put, select, takeLatest } from "redux-saga/effects";
import uuid from "uuid/v4";

import client, { getHeaders } from "@api";
import { StackParamList } from "../../App";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";
import { Actions as AppActions } from "./app";
import { Actions as UserActions } from "./user";

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
    loading: false
  },
  loading: false,
  commentsLoading: false,
  loadingPosts: {},
  error: ""
};

export default (
  state: PostState = initialState,
  action: ActionsUnion<typeof Actions>
): PostState => {
  switch (action.type) {
    case ActionTypes.FETCH_FEED: {
      return immer(state, draft => {
        draft.feed.loading = true;
        draft.error = "";

        return draft;
      });
    }

    case ActionTypes.FETCH_POST:
    case ActionTypes.FETCH_COMMENTS:
    case ActionTypes.SEND_COMMENT:
    case ActionTypes.DELETE_COMMENT: {
      return immer(state, draft => {
        draft.commentsLoading = true;

        return draft;
      });
    }

    case ActionTypes.FETCH_FEED_SUCCESS: {
      const { postIds, posts, users, comments } = action.payload;

      return immer(state, draft => {
        draft.feed = {
          loading: false,
          posts: postIds,
          stale: false,
          lastFetched: moment().toISOString()
        };

        draft.users = users;
        draft.comments = comments;
        draft.posts = posts;
      });
    }

    case ActionTypes.FETCH_POST_SUCCESS: {
      const { post, comments } = action.payload;

      return immer(state, draft => {
        draft.commentsLoading = false;

        draft.comments[post.id] = keyBy(comments, ({ id }) => id);
        draft.posts[post.id] = post;

        return draft;
      });
    }

    case ActionTypes.FETCH_USERS_POSTS:
    case ActionTypes.DELETE_POST:
    case ActionTypes.SEND_POST: {
      return immer(state, draft => {
        draft.loading = true;
        draft.feed.stale = true;

        draft.error = "";

        return draft;
      });
    }

    case ActionTypes.DELETE_POST_SUCCESS:
    case ActionTypes.SEND_POST_SUCCESS: {
      return immer(state, draft => {
        draft.loading = false;
        draft.feed.stale = true;

        return draft;
      });
    }

    case ActionTypes.FETCH_USERS_POSTS_SUCCESS: {
      const { phoneNumber, postIds, posts } = action.payload;

      return immer(state, draft => {
        draft.loading = false;
        draft.users[phoneNumber] = {
          posts: postIds,
          lastFetched: moment().toISOString()
        };

        draft.posts = _.merge(draft.posts, posts);

        return draft;
      });
    }

    case ActionTypes.FETCH_COMMENTS_SUCCESS: {
      const { postId, comments } = action.payload;

      return immer(state, draft => {
        draft.comments[postId] = keyBy(comments, ({ id }) => id);

        return draft;
      });
    }

    case ActionTypes.LOAD_COMMENT: {
      const { comment } = action.payload;

      return immer(state, draft => {
        const comments = draft.comments[comment.postId] ?? {};

        comments[comment.id] = comment;

        draft.comments[comment.postId] = comments;
        draft.commentsLoading = false;

        return draft;
      });
    }

    // TODO: implement deleting comments
    case ActionTypes.DELETE_COMMENT_SUCCESS: {
      const { postId, id } = action.payload;

      return immer(state, draft => {
        delete draft.comments[postId][id];

        draft.commentsLoading = false;

        return draft;
      });
    }

    case ActionTypes.LIKE_COMMENT: {
      return { ...state, commentsLoading: true };
    }

    case ActionTypes.ON_ERROR: {
      const { error } = action.payload;

      return immer(state, draft => {
        draft.error = error;
        draft.loading = false;
        draft.commentsLoading = false;
        draft.feed.loading = false;

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
      yield put(AppActions.expireCamera())
    ]);

    navigation.navigate("HOME");
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

    const res = yield client.get(`/post/${userFetched}/posts`, {
      headers: getHeaders({ jwt })
    });

    const { data } = res;

    const postIds = Object.keys(data);

    yield put(Actions.fetchUsersPostsSuccess(userFetched, postIds, data));
  } catch (err) {
    yield put(Actions.onError(err.message));
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
      headers: getHeaders({ jwt })
    });

    const { data }: { data: FeedEndpointReturn } = res;
    if (data) {
      const { postIds, posts, users, comments } = data;

      const postsByUser = _.groupBy(posts, ({ phoneNumber }) => phoneNumber);

      const userMap = Object.keys(users).reduce((acc, curr) => {
        acc[curr] = {
          posts: postsByUser[curr]?.map(({ id }) => id),
          lastFetched: moment().toISOString()
        };

        return acc;
      }, {} as UserMap);

      const commentMap: CommentMap = {};
      Object.keys(comments).map(
        key => (commentMap[key] = keyBy(comments[key], ({ id }) => id))
      );

      const userValues = Object.values(users);
      yield all([
        yield put(UserActions.loadUsers(userValues)),
        yield put(Actions.fetchFeedSuccess(postIds, posts, userMap, commentMap))
      ]);
    }

    // yield put(Actions.fetchFeedSuccess(posts));
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

function* onFetchPost(
  action: ExtractActionFromActionCreator<typeof Actions.fetchPost>
) {
  const { id } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);

    const res = yield client.get(`post/${id}`, {
      headers: getHeaders({ jwt })
    });

    const { data } = res;

    const { post, comments } = data;

    yield put(Actions.fetchPostSuccess(post, comments));
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

function* onFetchComments(
  action: ExtractActionFromActionCreator<typeof Actions.fetchComments>
) {
  const { postId } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);

    const res = yield client.get(`comment/${postId}`, {
      headers: getHeaders({ jwt })
    });

    const { data } = res;

    yield put(Actions.fetchCommentsSuccess(postId, data));
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

function* onSendComment(
  action: ExtractActionFromActionCreator<typeof Actions.sendComment>
) {
  const { comment } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const res = yield client.put(
      "/comment",
      { comment },
      { headers: getHeaders({ jwt }) }
    );

    const { data } = res;

    yield put(Actions.loadComment(data));
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

function* onDeleteComment(
  action: ExtractActionFromActionCreator<typeof Actions.deleteComment>
) {
  const { id } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);

    const res = yield client.delete(`/comment/${id}`, {
      headers: getHeaders({ jwt })
    });

    const {
      data: { postId }
    } = res;

    yield put(Actions.deleteCommentSuccess(postId, id));
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

function* onLikeComment(
  action: ExtractActionFromActionCreator<typeof Actions.likeComment>
) {
  const { id } = action.payload;

  try {
    const phoneNumber = yield select(selectors.phoneNumber);
    const jwt = yield select(selectors.jwt);

    const res = yield client.patch(
      `/comment/${phoneNumber}/like/${id}`,
      {},
      {
        headers: getHeaders({ jwt })
      }
    );

    const { data } = res;
    yield put(Actions.loadComment(data));
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

export function* postSagas() {
  yield all([
    yield takeLatest(ActionTypes.SEND_POST, onSendPost),
    yield takeLatest(ActionTypes.DELETE_POST, onDeletePost),
    yield takeLatest(ActionTypes.FETCH_USERS_POSTS, onFetchUsersPosts),
    yield takeLatest(ActionTypes.FETCH_FEED, onFetchFeed),
    yield takeLatest(ActionTypes.FETCH_POST, onFetchPost),
    yield takeLatest(ActionTypes.FETCH_COMMENTS, onFetchComments),
    yield takeLatest(ActionTypes.SEND_COMMENT, onSendComment),
    yield takeLatest(ActionTypes.DELETE_COMMENT, onDeleteComment),
    yield takeLatest(ActionTypes.LIKE_COMMENT, onLikeComment)
  ]);
}

export enum ActionTypes {
  FETCH_USERS_POSTS = "post/FETCH_USERS_POSTS",
  FETCH_USERS_POSTS_SUCCESS = "post/FETCH_USERS_POSTS_SUCCESS",
  FETCH_FEED = "post/FETCH_FEED",
  FETCH_FEED_SUCCESS = "post/FETCH_FEED_SUCCESS",
  FETCH_POST = "post/FETCH_POST",
  FETCH_POST_SUCCESS = "post/FETCH_POST_SUCCESS",
  SEND_POST = "post/SEND_POST",
  SEND_POST_SUCCESS = "post/SEND_POST_SUCCESS",
  SEND_COMMENT = "post/SEND_COMMENT",
  LOAD_COMMENT = "post/LOAD_COMMENT",
  LIKE_COMMENT = "post/LIKE_COMMENT",
  LIKE_COMMENT_SUCCESS = "post/LIKE_COMMENT_SUCCESS",
  FETCH_COMMENTS = "post/FETCH_COMMENTS",
  FETCH_COMMENTS_SUCCESS = "post/FETCH_COMMENTS_SUCCESS",
  DELETE_COMMENT = "post/DELETE_COMMENT",
  DELETE_COMMENT_SUCCESS = "post/DELETE_COMMENT_SUCCESS",
  DELETE_POST = "post/DELETE",
  DELETE_POST_SUCCESS = "post/DELETE_SUCCESS",
  ON_ERROR = "post/ERROR"
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
      posts
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
      comments
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

  sendComment: (comment: NewComment) =>
    createAction(ActionTypes.SEND_COMMENT, { comment }),
  loadComment: (comment: Comment) =>
    createAction(ActionTypes.LOAD_COMMENT, { comment }),

  fetchComments: (postId: string) =>
    createAction(ActionTypes.FETCH_COMMENTS, { postId }),
  fetchCommentsSuccess: (postId: string, comments: Comment[]) =>
    createAction(ActionTypes.FETCH_COMMENTS_SUCCESS, { postId, comments }),

  deleteComment: (id: string) =>
    createAction(ActionTypes.DELETE_COMMENT, { id }),
  deleteCommentSuccess: (postId: string, id: string) =>
    createAction(ActionTypes.DELETE_COMMENT_SUCCESS, { postId, id }),

  likeComment: (id: string) => createAction(ActionTypes.LIKE_COMMENT, { id }),

  onError: (error: string) => createAction(ActionTypes.ON_ERROR, { error })
};
