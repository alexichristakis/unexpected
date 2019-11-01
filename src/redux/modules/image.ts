import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";
import { TakePictureResponse } from "react-native-camera/types";

import client, { getHeaders } from "@api";
import * as selectors from "../selectors";
import { ActionsUnion, createAction } from "../utils";

export interface ImageState {
  currentImage: TakePictureResponse | null;
  uploading: boolean;
  uploadError: any;
}

const initialState: ImageState = {
  currentImage: null,
  uploading: false,
  uploadError: null
};

export type ImageActionTypes = ActionsUnion<typeof Actions>;
export default (state: ImageState = initialState, action: ImageActionTypes) => {
  switch (action.type) {
    case ActionTypes.TAKE_PHOTO: {
      const { image } = action.payload;
      return { ...state, currentImage: image };
    }

    case ActionTypes.ON_UPLOAD_PHOTO: {
      return { ...state, uploading: true };
    }

    case ActionTypes.UPLOAD_PHOTO: {
      return { ...state, uploading: false, currentImage: null };
    }

    default:
      return state;
  }
};

function* onUploadPhoto() {
  const { uri, width, height }: TakePictureResponse = yield select(selectors.currentImage);
  const phoneNumber = yield select(selectors.phoneNumber);
  const jwt = yield select(selectors.jwt);

  let body = new FormData();
  body.append("image", {
    uri,
    height,
    width,
    type: "image/jpeg",
    name: `${phoneNumber}-${Date.now()}.jpg`
  });

  try {
    yield client.put(`/image/${phoneNumber}`, body, {
      headers: getHeaders({ jwt, image: true })
    });

    yield put(Actions.uploadPhoto());
  } catch (err) {
    yield put(Actions.onUploadError(err));
  }
}

export function* imageSagas() {
  yield all([yield takeLatest(ActionTypes.ON_UPLOAD_PHOTO, onUploadPhoto)]);
}

export enum ActionTypes {
  TAKE_PHOTO = "image/TAKE_PHOTO",
  ON_UPLOAD_PHOTO = "image/ON_UPLOAD_PHOTO",
  UPLOAD_PHOTO = "image/UPLOAD_PHOTO",
  ON_UPLOAD_ERROR = "image/ON_UPLOAD_ERROR"
}

export const Actions = {
  takePhoto: (image: TakePictureResponse) => createAction(ActionTypes.TAKE_PHOTO, { image }),
  onUploadPhoto: () => createAction(ActionTypes.ON_UPLOAD_PHOTO),
  uploadPhoto: () => createAction(ActionTypes.UPLOAD_PHOTO),
  onUploadError: (err: any) => createAction(ActionTypes.ON_UPLOAD_ERROR, { err })
};
