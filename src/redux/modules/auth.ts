import { AxiosResponse, AxiosError } from "axios";
import { REHYDRATE } from "redux-persist";
import { batchActions, BATCH } from "redux-batched-actions";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import client from "@api";
import { VerifyPhoneReturnType, CheckCodeReturnType } from "@api/controllers/verify";
import { Actions as UserActions } from "./user";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";
// import Navigation from "../../Navigation";

export interface AuthState {
  readonly loading: boolean;
  readonly phoneNumber: string;
  readonly isAwaitingCode: boolean;
  readonly authError?: string;
  // readonly authFlowCompleted: boolean;
  readonly jwt: string | null;
}

const initialState: AuthState = {
  loading: false,
  phoneNumber: "",
  isAwaitingCode: false,
  authError: undefined,
  jwt: null
};

export type AuthActionTypes = ActionsUnion<typeof Actions>;
export default (state: AuthState = initialState, action: AuthActionTypes) => {
  switch (action.type) {
    case REHYDRATE as any: {
      const { err, payload } = action as any;

      const auth: AuthState = err ? state : payload && payload.auth;

      if (auth)
        return {
          ...initialState,
          jwt: auth.jwt
          // authFlowCompleted: auth.authFlowCompleted
        };
      else return { ...initialState };
    }

    case ActionTypes.REQUEST_AUTH || ActionTypes.CHECK_CODE: {
      const { phoneNumber } = action.payload;
      return { ...state, phoneNumber, loading: true, authError: null };
    }

    case ActionTypes.ERROR_REQUESTING_AUTH: {
      return { ...state, loading: false, authError: action.payload.err };
    }

    case ActionTypes.SUCCESS_TEXTING_CODE: {
      return { ...state, loading: false, isAwaitingCode: true, authError: null };
    }

    case ActionTypes.SET_JWT: {
      return {
        ...state,
        loading: false,
        isAwaitingCode: false,
        authError: null,
        jwt: action.payload
      };
    }

    // case ActionTypes.COMPLETED_AUTH_FLOW: {
    //   return {
    //     ...state,
    //     authFlowCompleted: true
    //   };
    // }

    case ActionTypes.LOGOUT: {
      // Navigation.navigate({ routeName: "Auth" });
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

    if (!data.verified) yield put(Actions.errorRequestingAuth("code invalid"));

    if (data.token) {
      if (data.user) {
        yield all([
          yield put(
            batchActions(
              [
                UserActions.loadUser(data.user),
                // Actions.completedAuthFlow(),
                Actions.setJWT(data.token)
              ],
              BATCH
            )
          )
          // yield Navigation.navigate({ routeName: "Home" })
        ]);
      } else {
        // user entity doesn't exist in DB: new user
        yield all([
          yield put(Actions.setJWT(data.token))
          // yield Navigation.navigate({ routeName: "SignUp" })
        ]);
      }
    }
  } catch (err) {
    yield put(Actions.errorRequestingAuth(err.message));
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
  // COMPLETED_AUTH_FLOW = "auth/COMPLETED_AUTH_FLOW",
  SET_JWT = "auth/SET_JWT",
  LOGOUT = "auth/LOGOUT"
}

export const Actions = {
  requestAuth: (phoneNumber: string) => createAction(ActionTypes.REQUEST_AUTH, { phoneNumber }),
  checkCode: (phoneNumber: string, code: string) =>
    createAction(ActionTypes.CHECK_CODE, { phoneNumber, code }),
  errorRequestingAuth: (err: string) => createAction(ActionTypes.ERROR_REQUESTING_AUTH, { err }),
  successTextingCode: () => createAction(ActionTypes.SUCCESS_TEXTING_CODE),
  // completedAuthFlow: () => createAction(ActionTypes.COMPLETED_AUTH_FLOW),
  setJWT: (jwt: string) => createAction(ActionTypes.SET_JWT, jwt),
  logout: () => createAction(ActionTypes.LOGOUT)
};
