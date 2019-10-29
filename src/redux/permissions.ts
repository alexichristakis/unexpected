import { ActionsUnion, createAction } from "./utils";

export interface PermissionsState {
  readonly notifications: boolean;
  readonly location: boolean;
  readonly contacts: boolean;
  readonly error: string;
}

const initialState: PermissionsState = {
  notifications: false,
  location: false,
  contacts: false,
  error: ""
};

export type PermissionsActionTypes = ActionsUnion<typeof Actions>;
export default (state: PermissionsState = initialState, action: PermissionsActionTypes) => {
  switch (action.type) {
    case ActionTypes.REQUEST_NOTIFICATIONS: {
    }

    case ActionTypes.REQUEST_LOCATION: {
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
