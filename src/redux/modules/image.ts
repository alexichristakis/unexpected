import { TakePictureResponse } from "react-native-camera/types";
import {
  all,
  fork,
  call,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";
import ImageResizer, {
  Response as ImageResizerResponse
} from "react-native-image-resizer";

import client, { getHeaders } from "@api";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";

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

export default (
  state: ImageState = initialState,
  action: ActionsUnion<typeof Actions>
): ImageState => {
  switch (action.type) {
    case ActionTypes.TAKE_PHOTO: {
      const { image } = action.payload;
      return { ...state, currentImage: image };
    }

    case ActionTypes.UPLOAD_PHOTO: {
      return { ...state, uploading: true };
    }

    case ActionTypes.CLEAR_PHOTO:
    case ActionTypes.UPLOAD_PHOTO_SUCCESS: {
      return { ...state, uploading: false, currentImage: null };
    }

    case ActionTypes.UPLOAD_PHOTO_ERROR: {
      return { ...state, uploadError: action.payload.err };
    }

    default:
      return state;
  }
};

function* onUploadPhoto(
  action: ExtractActionFromActionCreator<typeof Actions.uploadPhoto>
) {
  const { id, cb } = action.payload;
  try {
    const { uri, width, height }: TakePictureResponse = yield select(
      selectors.currentImage
    );
    const phoneNumber = yield select(selectors.phoneNumber);
    const jwt = yield select(selectors.jwt);

    const image: ImageResizerResponse = yield ImageResizer.createResizedImage(
      uri,
      200,
      200,
      "JPEG",
      100
    );

    const body = new FormData();
    body.append("image", {
      uri: image.uri,
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

    yield put(Actions.uploadPhotoSuccess());
    if (cb) yield cb();
  } catch (err) {
    yield put(Actions.uploadPhotoError(err.message));
  }
}

export function* imageSagas() {
  yield all([yield takeLatest(ActionTypes.UPLOAD_PHOTO, onUploadPhoto)]);
}

export enum ActionTypes {
  TAKE_PHOTO = "image/TAKE_PHOTO",
  UPLOAD_PHOTO = "image/UPLOAD_PHOTO",
  UPLOAD_PHOTO_SUCCESS = "image/UPLOAD_PHOTO_SUCCESS",
  UPLOAD_PHOTO_ERROR = "image/ON_UPLOAD_ERROR",
  CLEAR_PHOTO = "image/CLEAR_PHOTO"
}

export const Actions = {
  takePhoto: (image: TakePictureResponse) =>
    createAction(ActionTypes.TAKE_PHOTO, { image }),
  clearPhoto: () => createAction(ActionTypes.CLEAR_PHOTO),
  uploadPhoto: (id?: string, cb?: () => void) =>
    createAction(ActionTypes.UPLOAD_PHOTO, { id, cb }),
  uploadPhotoSuccess: () => createAction(ActionTypes.UPLOAD_PHOTO_SUCCESS),
  uploadPhotoError: (err: any) =>
    createAction(ActionTypes.UPLOAD_PHOTO_ERROR, { err })
};
