import { AuthState as AuthStateType } from "./modules/auth";
import { UserState as UserStateType } from "./modules/user";
import { AppState as AppStateType } from "./modules/app";
import { PermissionsState as PermissionsStateType } from "./modules/permissions";

export interface AppState {
  app: AppStateType;
  auth: AuthStateType;
  user: UserStateType;
  permissions: PermissionsStateType;
}
