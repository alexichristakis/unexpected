import { PermissionsState as PermissionsStateType } from "./types";
import { ActionsUnion, createAction } from "./utils";

const initialState: PermissionsStateType = {
  notifications: false,
  location: false,
  contacts: false
};

type PermissionsActionTypes = ActionsUnion<typeof Actions>;
export default (state: PermissionsStateType = initialState, action: PermissionsActionTypes) => {
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
  REQUEST_NOTIFICATIONS = "permissions/REQUEST_NOTIFICATIONS",
  SET_NOTIFICATIONS = "permissions/SET_NOTIFICATIONS",
  REQUEST_LOCATION = "permissions/REQUEST_LOCATION",
  SET_LOCATION = "permissions/SET_LOCATION",
  ERROR_REQUESTING = "permissions/ERROR_REQUESTING"
}

export const Actions = {
  requestNotifications: () => createAction(ActionTypes.REQUEST_NOTIFICATIONS),
  requestLocation: () => createAction(ActionTypes.REQUEST_LOCATION),
  errorRequestingPermissions: (err: any) => createAction(ActionTypes.ERROR_REQUESTING, err)
};
