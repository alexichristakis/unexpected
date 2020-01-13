import { AppState as AppStateType } from "./modules/app";
import { AuthState as AuthStateType } from "./modules/auth";
import { ImageState as ImageStateType } from "./modules/image";
import { PermissionsState as PermissionsStateType } from "./modules/permissions";
import { PostState as PostStateType } from "./modules/post";
import { UserState as UserStateType } from "./modules/user";

export interface RootState {
  app: AppStateType;
  auth: AuthStateType;
  user: UserStateType;
  permissions: PermissionsStateType;
  image: ImageStateType;
  post: PostStateType;
}

export type ReduxPropsType<S extends (state: any, props?: any) => any, D> = D & ReturnType<S>;
