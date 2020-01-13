import AsyncStorage from "@react-native-community/async-storage";
import { AxiosError, AxiosResponse } from "axios";
import { BATCH, batchActions } from "redux-batched-actions";
import { persistStore, REHYDRATE } from "redux-persist";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import client from "@api";
import {
  CheckCodeReturnType,
  VerifyPhoneReturnType
} from "unexpected-cloud/controllers/verify";
import Navigation from "../../navigation";
import {
  ActionsUnion,
  createAction,
  ExtractActionFromActionCreator
} from "../utils";
import { Actions as UserActions } from "./user";

export interface AuthState {
  readonly loading: boolean;
  readonly phoneNumber: string;
  readonly isAwaitingCode: boolean;
  readonly authError: string;
  readonly jwt: string | null;
}

const initialState: AuthState = {
  loading: false,
  phoneNumber: "",
  isAwaitingCode: false,
  authError: "",
  jwt: null
};

export default (
  state: AuthState = initialState,
  action: ActionsUnion<typeof Actions>
): AuthState => {
  switch (action.type) {
    case REHYDRATE as any: {
      const { err, payload } = action as any;

      const auth: AuthState = err ? state : payload && payload.auth;

      if (auth)
        return {
          ...initialState,
          jwt: auth.jwt
        };
      else return { ...initialState };
    }

    case ActionTypes.RESET: {
      return { ...initialState };
    }

    case ActionTypes.CHECK_CODE:
    case ActionTypes.REQUEST_AUTH: {
      const { phoneNumber } = action.payload;

      return { ...state, phoneNumber, loading: true, authError: "" };
    }

    case ActionTypes.ERROR_REQUESTING_AUTH: {
      return { ...state, loading: false, authError: action.payload.err };
    }

    case ActionTypes.TEXT_CODE_SUCCESS: {
      return { ...state, loading: false, isAwaitingCode: true, authError: "" };
    }

    case ActionTypes.SET_JWT: {
      return {
        ...state,
        loading: false,
        isAwaitingCode: false,
        authError: "",
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

function* onLoginRequest(
  action: ExtractActionFromActionCreator<typeof Actions.requestAuth>
) {
  const { phoneNumber } = action.payload;

  if (phoneNumber === "0000000000") {
    yield put(Actions.successTextingCode());
  } else
    try {
      const res: AxiosResponse<VerifyPhoneReturnType> = yield client.post(
        `/verify/${phoneNumber}`
      );
      if (res.data) {
        yield put(Actions.successTextingCode());
      }
    } catch (err) {
      yield put(Actions.errorRequestingAuth(err.message));
    }
}

function* onVerifyCodeRequest(
  action: ExtractActionFromActionCreator<typeof Actions.checkCode>
) {
  const { phoneNumber, code } = action.payload;

  if (phoneNumber === "0000000000" && code === "000000") {
    yield all([
      yield put(Actions.setJWT("DEV_TOKEN")),
      yield Navigation.navigate("SIGN_UP")
    ]);
  } else
    try {
      const res: AxiosResponse<CheckCodeReturnType> = yield client.post(
        `/verify/${phoneNumber}/${code}`
      );

      const { data } = res;

      if (!data.verified)
        yield put(Actions.errorRequestingAuth("code invalid"));

      if (data.token) {
        if (data.user) {
          yield all([
            yield put(
              batchActions(
                [
                  UserActions.createUserSuccess(data.user),
                  Actions.setJWT(data.token)
                ],
                BATCH
              )
            ),
            yield Navigation.navigate("AUTHENTICATED")
          ]);
        } else {
          // user entity doesn't exist in DB: new user
          yield all([
            yield put(Actions.setJWT(data.token)),
            yield Navigation.navigate("SIGN_UP")
          ]);
        }
      }
    } catch (err) {
      yield put(Actions.errorRequestingAuth(err.message));
    }
}

function* onLogout() {
  Navigation.navigate("HOME");
  setTimeout(() => Navigation.navigate("UNAUTHENTICATED"), 100);
  setTimeout(() => AsyncStorage.clear(), 200);
}

export function* authSagas() {
  yield all([
    yield takeLatest(ActionTypes.REQUEST_AUTH, onLoginRequest),
    yield takeLatest(ActionTypes.CHECK_CODE, onVerifyCodeRequest),
    yield takeLatest(ActionTypes.LOGOUT, onLogout)
  ]);
}

export enum ActionTypes {
  REQUEST_AUTH = "auth/REQUEST_AUTH",
  CHECK_CODE = "auth/CHECK_CODE",
  ERROR_REQUESTING_AUTH = "auth/ERROR_REQUESTING_AUTH",
  TEXT_CODE_SUCCESS = "auth/TEXT_CODE_SUCCESS",
  SET_JWT = "auth/SET_JWT",
  RESET = "auth/RESET",
  LOGOUT = "auth/LOGOUT"
}

export const Actions = {
  requestAuth: (phoneNumber: string) =>
    createAction(ActionTypes.REQUEST_AUTH, { phoneNumber }),
  checkCode: (phoneNumber: string, code: string) =>
    createAction(ActionTypes.CHECK_CODE, { phoneNumber, code }),
  errorRequestingAuth: (err: string) =>
    createAction(ActionTypes.ERROR_REQUESTING_AUTH, { err }),
  successTextingCode: () => createAction(ActionTypes.TEXT_CODE_SUCCESS),
  setJWT: (jwt: string) => createAction(ActionTypes.SET_JWT, jwt),
  reset: () => createAction(ActionTypes.RESET),
  logout: () => createAction(ActionTypes.LOGOUT)
};