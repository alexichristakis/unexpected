import { AuthState as AuthStateType } from "./types";

const initialState: AuthStateType = {
  isRequestingAuth: false,
  errorRequestingAuth: null,
  jwt: null
};

type AuthActionTypes = RequestAuth | ErrorRequestingAuth | SucessRequestingAuth;
export default (state: AuthStateType = initialState, action: AuthActionTypes) => {
  switch (action.type) {
    case REQUEST_AUTH:
      return { ...state, isRequestingAuth: true, errorRequestingAuth: null };

    case ERROR_REQUESTING_AUTH:
      return { ...state, isRequestingAuth: false, errorRequestingAuth: action.error };

    case SUCCESS_REQUESTING_AUTH:
      return { ...state, isRequestingAuth: false, errorRequestingAuth: null, jwt: action.jwt };

    default:
      return state;
  }
};

const REQUEST_AUTH = "auth/REQUEST_AUTH";
export class RequestAuth {
  readonly type = REQUEST_AUTH;
  constructor() {}
}

const ERROR_REQUESTING_AUTH = "auth/ERROR_REQUESTING_AUTH";
export class ErrorRequestingAuth {
  readonly type = ERROR_REQUESTING_AUTH;
  constructor(public error: any) {}
}

const SUCCESS_REQUESTING_AUTH = "auth/SUCCESS_REQUESTING_AUTH";
export class SucessRequestingAuth {
  readonly type = SUCCESS_REQUESTING_AUTH;
  constructor(public jwt: string) {}
}
