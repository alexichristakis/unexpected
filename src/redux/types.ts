import { AuthState as AuthStateType } from "./modules/auth";
import { UserState as UserStateType } from "./modules/user";
import { AppState as AppStateType } from "./modules/app";
import { PermissionsState as PermissionsStateType } from "./modules/permissions";
import { ImageState as ImageStateType } from "./modules/image";

export interface RootState {
  app: AppStateType;
  auth: AuthStateType;
  user: UserStateType;
  permissions: PermissionsStateType;
  image: ImageStateType;
}
