import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";
import { TakePictureResponse } from "react-native-camera/types";

import client, { getHeaders } from "@api";
import * as selectors from "../selectors";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";

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

    case ActionTypes.ON_UPLOAD_ERROR: {
      return { ...state, uploadError: action.payload.err };
    }

    default:
      return state;
  }
};

function* onUploadPhoto(action: ExtractActionFromActionCreator<typeof Actions.onUploadPhoto>) {
  const { id } = action.payload;
  try {
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

    let endpoint = `/image/${phoneNumber}`;
    if (id) endpoint += `/${id}`;

    yield client.put(endpoint, body, {
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
  onUploadPhoto: (id?: string) => createAction(ActionTypes.ON_UPLOAD_PHOTO, { id }),
  uploadPhoto: () => createAction(ActionTypes.UPLOAD_PHOTO),
  onUploadError: (err: any) => createAction(ActionTypes.ON_UPLOAD_ERROR, { err })
};
