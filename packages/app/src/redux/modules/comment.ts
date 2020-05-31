import immer from "immer";
import { all, call, put, select, takeLatest } from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { Comment, NewComment, Post, User } from "@global";
import * as selectors from "../selectors";

import keyBy from "lodash/keyBy";
import {
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";

type CommentMap = {
  [postId: string]: { [commentId: string]: Comment };
};

export type CommentState = Readonly<{
  loading: boolean;
  comments: CommentMap;
}>;

const initialState: CommentState = {
  loading: false,
  comments: {},
};

export default (
  state: CommentState = initialState,
  action: ActionUnion
): CommentState => {
  switch (action.type) {
    case ActionTypes.FETCH_COMMENTS_SUCCESS: {
      const { postId, comments } = action.payload;

      return immer(state, (draft) => {
        draft.comments[postId] = keyBy(comments, ({ id }) => id);
      });
    }

    case ActionTypes.LOAD_COMMENT: {
      const { comment } = action.payload;

      return immer(state, (draft) => {
        const comments = draft.comments[comment.post] ?? {};

        comments[comment.id] = comment;

        draft.comments[comment.post] = comments;
        draft.loading = false;
      });
    }

    // TODO: implement deleting comments
    case ActionTypes.DELETE_COMMENT_SUCCESS: {
      const { postId, id } = action.payload;

      return immer(state, (draft) => {
        delete draft.comments[postId][id];

        draft.loading = false;
      });
    }

    case ActionTypes.LIKE_COMMENT: {
      return { ...state, loading: true };
    }

    default:
      return state;
  }
};

function* onFetchComments(
  action: ExtractActionFromActionCreator<typeof Actions.fetchComments>
) {
  const { postId } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);

    const res = yield client.get(`comment/${postId}`, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;

    yield put(Actions.fetchCommentsSuccess(postId, data));
  } catch (err) {
    yield put(Actions.onCommentError(err.message));
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
    yield put(Actions.onCommentError(err.message));
  }
}

function* onDeleteComment(
  action: ExtractActionFromActionCreator<typeof Actions.deleteComment>
) {
  const { id } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);

    const res = yield client.delete(`/comment/${id}`, {
      headers: getHeaders({ jwt }),
    });

    const {
      data: { postId },
    } = res;

    yield put(Actions.deleteCommentSuccess(postId, id));
  } catch (err) {
    yield put(Actions.onCommentError(err.message));
  }
}

function* onLikeComment(
  action: ExtractActionFromActionCreator<typeof Actions.likeComment>
) {
  // const { id } = action.payload;
  // try {
  //   const phoneNumber = yield select(selectors.phoneNumber);
  //   const jwt = yield select(selectors.jwt);
  //   const res = yield client.patch(
  //     `/comment/${phoneNumber}/like/${id}`,
  //     {},
  //     {
  //       headers: getHeaders({ jwt }),
  //     }
  //   );
  //   const { data } = res;
  //   yield put(Actions.loadComment(data));
  // } catch (err) {
  //   yield put(Actions.onCommentError(err));
  // }
}

export function* commentSagas() {
  yield all([
    yield takeLatest(ActionTypes.FETCH_COMMENTS, onFetchComments),
    yield takeLatest(ActionTypes.SEND_COMMENT, onSendComment),
    yield takeLatest(ActionTypes.DELETE_COMMENT, onDeleteComment),
    yield takeLatest(ActionTypes.LIKE_COMMENT, onLikeComment),
  ]);
}

export const Actions = {
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

  onCommentError: (error: string) =>
    createAction(ActionTypes.COMMENT_ERROR, { error }),
};
