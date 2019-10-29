import { AuthState as AuthStateType } from "./auth";
import { UserState as UserStateType } from "./user";
import { NotificationState as NotificationStateType } from "./notifications";
import { PermissionsState as PermissionsStateType } from "./permissions";

export interface AppState {
  auth: AuthStateType;
  user: UserStateType;
  notifications: NotificationStateType;
  permissions: PermissionsStateType;
}
