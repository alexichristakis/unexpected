import { AuthState as AuthStateType } from "./types";
import { ActionsUnion, createAction } from "./utils";

const initialState: AuthStateType = {
  loading: false,
  isAwaitingCode: false,
  authError: null,
  jwt: null
};

type AuthActionTypes = ActionsUnion<typeof Actions>;
export default (state: AuthStateType = initialState, action: AuthActionTypes) => {
  switch (action.type) {
    case ActionTypes.REQUEST_AUTH: {
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

    default:
      return state;
  }
};

export enum ActionTypes {
  REQUEST_AUTH = "auth/REQUEST_AUTH",
  ERROR_REQUESTING_AUTH = "auth/ERROR_REQUESTING_AUTH",
  SUCCESS_TEXTING_CODE = "auth/SUCCESS_TEXTING_CODE",
  SET_JWT = "auth/SET_JWT"
}

export const Actions = {
  requestAuth: () => createAction(ActionTypes.REQUEST_AUTH),
  errorRequestingAuth: (err: any) => createAction(ActionTypes.ERROR_REQUESTING_AUTH, err),
  successTextingCode: () => createAction(ActionTypes.SUCCESS_TEXTING_CODE),
  setJWT: (jwt: string) => createAction(ActionTypes.SET_JWT, jwt)
};
