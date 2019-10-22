import { AxiosResponse } from "axios";
import { REHYDRATE } from "redux-persist";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import client from "@api";
import { VerifyPhoneReturnType, CheckCodeReturnType } from "@api/controllers/verify";
import { AuthState as AuthStateType } from "./types";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "./utils";

const initialState: AuthStateType = {
  loading: false,
  isAwaitingCode: false,
  authError: null,
  jwt: null
};

type AuthActionTypes = ActionsUnion<typeof Actions>;
export default (state: AuthStateType = initialState, action: AuthActionTypes) => {
  switch (action.type) {
    case REHYDRATE as any: {
      const { err, payload } = action as any;

      const auth: AuthStateType = err ? state : payload && payload.auth;

      return {
        ...initialState,
        jwt: auth.jwt
      };
    }

    case ActionTypes.REQUEST_AUTH || ActionTypes.CHECK_CODE: {
      return { ...state, loading: true, errorRequestingAuth: null };
    }

    case ActionTypes.ERROR_REQUESTING_AUTH: {
      return { ...state, loading: false, errorRequestingAuth: action.payload };
    }

    case ActionTypes.SUCCESS_TEXTING_CODE: {
      return { ...state, loading: false, isAwaitingCode: true, errorRequestingAuth: null };
    }

    case ActionTypes.SET_JWT: {
      return {
        ...state,
        loading: false,
        isAwaitingCode: false,
        errorRequestingAuth: null,
        jwt: action.payload
      };
    }

    case ActionTypes.LOGOUT: {
      return {
        ...state,
        jwt: null
      };
    }

    default:
      return state;
  }
};

function* onLoginRequest(action: ExtractActionFromActionCreator<typeof Actions.requestAuth>) {
  const { phoneNumber } = action.payload;

  try {
    const res: AxiosResponse<VerifyPhoneReturnType> = yield client.post(`/verify/${phoneNumber}`);
    if (res.data) {
      yield put(Actions.successTextingCode());
    }
  } catch (err) {
    yield put(Actions.errorRequestingAuth(err));
  }
}

function* onVerifyCodeRequest(action: ExtractActionFromActionCreator<typeof Actions.checkCode>) {
  const { phoneNumber, code } = action.payload;

  try {
    const res: AxiosResponse<CheckCodeReturnType> = yield client.post(
      `/verify/${phoneNumber}/${code}`
    );

    const { data } = res;

    if (data.response && data.token) {
      yield put(Actions.setJWT(data.token));
    }
  } catch (err) {
    yield put(Actions.errorRequestingAuth(err));
  }
}

export function* authSagas() {
  yield all([
    yield takeLatest(ActionTypes.REQUEST_AUTH, onLoginRequest),
    yield takeLatest(ActionTypes.CHECK_CODE, onVerifyCodeRequest)
  ]);
}

export enum ActionTypes {
  REQUEST_AUTH = "auth/REQUEST_AUTH",
  CHECK_CODE = "auth/CHECK_CODE",
  ERROR_REQUESTING_AUTH = "auth/ERROR_REQUESTING_AUTH",
  SUCCESS_TEXTING_CODE = "auth/SUCCESS_TEXTING_CODE",
  SET_JWT = "auth/SET_JWT",
  LOGOUT = "auth/LOGOUT"
}

export const Actions = {
  requestAuth: (phoneNumber: string) => createAction(ActionTypes.REQUEST_AUTH, { phoneNumber }),
  checkCode: (phoneNumber: string, code: string) =>
    createAction(ActionTypes.CHECK_CODE, { phoneNumber, code }),
  errorRequestingAuth: (err: any) => createAction(ActionTypes.ERROR_REQUESTING_AUTH, err),
  successTextingCode: () => createAction(ActionTypes.SUCCESS_TEXTING_CODE),
  setJWT: (jwt: string) => createAction(ActionTypes.SET_JWT, jwt),
  logout: () => createAction(ActionTypes.LOGOUT)
};
