import { all, fork, put, select, take, takeLatest, takeEvery } from "redux-saga/effects";
import uuid from "uuid/v4";

import client, { getHeaders } from "@api";
import * as selectors from "../selectors";
import { Actions as ImageActions } from "./image";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";

export interface PostState {
  id: string;
  loading: boolean;
  description: string;
}

const initialState: PostState = {
  id: "",
  loading: false,
  description: ""
};

export type StarterActionTypes = ActionsUnion<typeof Actions>;
export default (state: PostState = initialState, action: StarterActionTypes) => {
  switch (action.type) {
    case ActionTypes.ON_SEND_POST: {
      return { ...state, loading: true };
    }

    case ActionTypes.SEND_POST: {
      return { ...initialState };
    }

    default:
      return state;
  }
};

function* onSendPost(action: ExtractActionFromActionCreator<typeof Actions.onSendPost>) {
  const { description } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);
    const phoneNumber = yield select(selectors.phoneNumber);
    const id = uuid();

    const post = {
      photoId: id,
      phoneNumber,
      description
    };

    yield client.put(`/post/${phoneNumber}`, post, { headers: getHeaders({ jwt }) });
    yield put(ImageActions.onUploadPhoto(id));
  } catch (err) {}
}

export function* postSagas() {
  yield all([yield takeEvery(ActionTypes.ON_SEND_POST, onSendPost)]);
}

export enum ActionTypes {
  ON_SEND_POST = "post/ON_SEND_POST",
  SEND_POST = "post/SEND_POST"
}

export const Actions = {
  onSendPost: (description: string) => createAction(ActionTypes.ON_SEND_POST, { description }),
  sendPost: () => createAction(ActionTypes.SEND_POST)
};
