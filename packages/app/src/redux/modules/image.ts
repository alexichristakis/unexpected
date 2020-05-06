import { Platform } from "react-native";

import immer from "immer";
import { TakePictureResponse } from "react-native-camera/types";
import RNFS, { DownloadResult } from "react-native-fs";
import ImageResizer, {
  Response as ImageResizerResponse
} from "react-native-image-resizer";
import { all, put, select, takeEvery, takeLatest } from "redux-saga/effects";

import client, { getHeaders, getPostImageURL, getUserProfileURL } from "@api";
import * as selectors from "../selectors";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";

// export type Cache = {
//   [phoneNumber: string]: Proxy<CacheEntry>;
// };

export interface CacheEntry {
  ts: number;
  uri: string;
  fallback: string;
}

export interface ImageState {
  currentImage: TakePictureResponse | null;
  uploading: boolean;
  uploadError: any;
  cache: {
    profile: {
      [phoneNumber: string]: CacheEntry;
    };
    feed: {
      [phoneNumber: string]: {
        [id: string]: CacheEntry;
      };
    };
  };
}

const initialState: ImageState = {
  currentImage: null,
  uploading: false,
  uploadError: null,
  cache: {
    profile: {},
    feed: {}
  }
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

    case ActionTypes.UPLOAD_PROFILE_PHOTO: {
      return { ...state, uploading: true };
    }

    case ActionTypes.CACHE_PHOTO: {
      const { uri, phoneNumber, id } = action.payload;

      if (id) {
        return immer(state, draft => {
          const entry = {
            uri,
            ts: new Date().getTime(),
            fallback: getPostImageURL(phoneNumber, id)
          };

          if (draft.cache.feed[phoneNumber]) {
            draft.cache.feed[phoneNumber][id] = entry;
          } else {
            draft.cache.feed[phoneNumber] = { [id]: entry };
          }

          return draft;
        });
      } else {
        return immer(state, draft => {
          draft.cache.profile[phoneNumber] = {
            uri,
            ts: new Date().getTime(),
            fallback: getUserProfileURL(phoneNumber)
          };

          return draft;
        });
      }
    }

    case ActionTypes.CLEAR_PHOTO:
    case ActionTypes.SUCCESS_UPLOADING_PHOTO: {
      return { ...state, uploading: false, currentImage: null };
    }

    case ActionTypes.ERROR: {
      return { ...state, uploadError: action.payload.err };
    }

    default:
      return state;
  }
};

function* onUploadProfilePhoto(
  action: ExtractActionFromActionCreator<typeof Actions.uploadProfilePhoto>
) {
  const { cb } = action.payload;
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
      // @ts-ignore
      uri: image.uri,
      height,
      width,
      type: "image/jpeg",
      name: `${phoneNumber}-${Date.now()}.jpg`
    });

    const endpoint = `/image/${phoneNumber}`;

    yield client.put(endpoint, body, {
      headers: getHeaders({ jwt, image: true })
    });

    yield put(Actions.uploadPhotoSuccess());
    yield put(Actions.cachePhoto(image.uri, phoneNumber));
    if (cb) yield cb();
  } catch (err) {
    yield put(Actions.onError(err.message));
  }
}

const getFilePath = (name: string) => {
  // const FILE = Platform.OS === "ios" ? "" : "file://";
  return `${RNFS.DocumentDirectoryPath}/${name}.jpg`;
};

function* onRequestCache(
  action: ExtractActionFromActionCreator<typeof Actions.requestCache>
) {
  const { phoneNumber, id } = action.payload;
  const jwt = yield select(selectors.jwt);

  try {
    const fileName = id ? `${phoneNumber}_${id}` : `${phoneNumber}`;
    const filePath = getFilePath(fileName);

    const url = id
      ? getPostImageURL(phoneNumber, id)
      : getUserProfileURL(phoneNumber);

    const response: DownloadResult = yield RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      headers: getHeaders({ jwt })
    }).promise;

    if (response.bytesWritten) {
      yield put(Actions.cachePhoto(filePath, phoneNumber, id));
    }
  } catch (err) {
    yield put(Actions.onError(err));
  }
}

export function* imageSagas() {
  yield all([
    yield takeLatest(ActionTypes.UPLOAD_PROFILE_PHOTO, onUploadProfilePhoto),
    yield takeEvery(ActionTypes.REQUEST_CACHE, onRequestCache)
  ]);
}

export enum ActionTypes {
  TAKE_PHOTO = "image/TAKE_PHOTO",
  UPLOAD_PROFILE_PHOTO = "image/UPLOAD_PROFILE_PHOTO",
  SUCCESS_UPLOADING_PHOTO = "image/UPLOAD_PHOTO_SUCCESS",
  ERROR = "image/ERROR",
  CACHE_PHOTO = "image/CACHE_PHOTO_SUCCESS",
  REQUEST_CACHE = "image/REQUEST_CACHE",
  CLEAR_PHOTO = "image/CLEAR_PHOTO"
}

export const Actions = {
  takePhoto: (image: TakePictureResponse) =>
    createAction(ActionTypes.TAKE_PHOTO, { image }),
  clearPhoto: () => createAction(ActionTypes.CLEAR_PHOTO),
  requestCache: (phoneNumber: string, id?: string) =>
    createAction(ActionTypes.REQUEST_CACHE, { phoneNumber, id }),
  cachePhoto: (uri: string, phoneNumber: string, id?: string) =>
    createAction(ActionTypes.CACHE_PHOTO, { uri, phoneNumber, id }),
  uploadProfilePhoto: (cb?: () => void) =>
    createAction(ActionTypes.UPLOAD_PROFILE_PHOTO, { cb }),
  uploadPhotoSuccess: () => createAction(ActionTypes.SUCCESS_UPLOADING_PHOTO),
  onError: (err: any) => createAction(ActionTypes.ERROR, { err })
};
