import { AuthState as AuthStateType, AuthActionTypes, REQUEST_AUTH, LOAD_JWT } from "../types";

const initialState: AuthStateType = {
  isRequestingAuth: false,
  errorRequestingAuth: null,
  jwt: null
};

export default (state: AuthStateType = initialState, action: AuthActionTypes) => {
  switch (action.type) {
    case REQUEST_AUTH:
      return state;

    case LOAD_JWT:
      action.jwt;

      return state;

    default:
      return state;
  }
};
