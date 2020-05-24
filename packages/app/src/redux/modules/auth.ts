import AsyncStorage from "@react-native-community/async-storage";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { REHYDRATE } from "redux-persist";
import {
  all,
  call,
  fork,
  put,
  select,
  take,
  takeLatest,
} from "redux-saga/effects";

import client from "@api";
import { StackParamList } from "../../App";
import * as selectors from "../selectors";
import {
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";
import { Actions as UserActions } from "./user";

export interface AuthState {
  loading: boolean;
  phone: string;
  isNewAccount: boolean;
  isAwaitingCode: boolean;
  authError: string;
  jwt: string | null;
}

const initialState: AuthState = {
  loading: false,
  phone: "",
  isNewAccount: false,
  isAwaitingCode: false,
  authError: "",
  jwt: null,
};

export default (
  state: AuthState = initialState,
  action: ActionUnion
): AuthState => {
  switch (action.type) {
    case REHYDRATE as any: {
      const { err, payload } = action as any;

      const auth: AuthState = err ? state : payload && payload.auth;

      if (auth)
        return {
          ...initialState,
          jwt: auth.jwt,
        };
      else return { ...initialState };
    }

    case ActionTypes.RESET: {
      return { ...initialState };
    }

    case ActionTypes.CHECK_CODE:
    case ActionTypes.REQUEST_AUTH: {
      const { phone } = action.payload;

      return { ...state, phone, loading: true, authError: "" };
    }

    case ActionTypes.ERROR_REQUESTING_AUTH: {
      return { ...state, loading: false, authError: action.payload.err };
    }

    case ActionTypes.TEXT_CODE_SUCCESS: {
      return { ...state, loading: false, isAwaitingCode: true, authError: "" };
    }

    case ActionTypes.SET_JWT: {
      const { jwt, isNewAccount } = action.payload;

      return {
        ...state,
        loading: false,
        isAwaitingCode: false,
        authError: "",
        isNewAccount,
        jwt,
      };
    }

    case ActionTypes.LOGOUT: {
      return {
        ...state,
        jwt: null,
      };
    }

    default:
      return state;
  }
};

function* onLoginRequest(
  action: ExtractActionFromActionCreator<typeof Actions.requestAuth>
) {
  const { phone } = action.payload;

  try {
    const res = yield call(client.post, `/auth/${phone}`);
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
  const { code } = action.payload;

  const phone = yield select(selectors.authPhoneNumber);

  try {
    const res = yield client.post(`/auth/${phone}/${code}`);

    const { data } = res;

    console.log(data);

    if (!data.verified) {
      yield put(Actions.errorRequestingAuth("code invalid"));
    }

    if (data.token) {
      if (data.user) {
        yield put(UserActions.createUserSuccess(data.user));
        yield put(Actions.setJWT(data.token, data.isNewUser));
      }
    }
  } catch (err) {
    yield put(Actions.errorRequestingAuth(err.message));
  }
}

function* onLogout() {
  yield AsyncStorage.clear();
}

export function* authSagas() {
  yield all([
    yield takeLatest(ActionTypes.REQUEST_AUTH, onLoginRequest),
    yield takeLatest(ActionTypes.CHECK_CODE, onVerifyCodeRequest),
    yield takeLatest(ActionTypes.LOGOUT, onLogout),
  ]);
}

export const Actions = {
  requestAuth: (phone: string) =>
    createAction(ActionTypes.REQUEST_AUTH, { phone }),

  checkCode: (
    phone: string,
    code: string,
    navigation: NativeStackNavigationProp<StackParamList>
  ) =>
    createAction(ActionTypes.CHECK_CODE, {
      phone,
      code,
      navigation,
    }),

  errorRequestingAuth: (err: string) =>
    createAction(ActionTypes.ERROR_REQUESTING_AUTH, { err }),

  successTextingCode: () => createAction(ActionTypes.TEXT_CODE_SUCCESS),
  setJWT: (jwt: string, isNewAccount: boolean = false) =>
    createAction(ActionTypes.SET_JWT, { jwt, isNewAccount }),

  reset: () => createAction(ActionTypes.RESET),
  logout: () => createAction(ActionTypes.LOGOUT),
};
