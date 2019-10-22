export interface AppState {
  auth: AuthState;
  permissions: PermissionsState;
}

export interface AuthState {
  readonly loading: boolean;
  readonly isAwaitingCode: boolean;
  readonly authError: any;
  readonly jwt: string | null;
}

export interface PermissionsState {
  readonly notifications: boolean;
  readonly location: boolean;
  readonly contacts: boolean;
  readonly error: string;
}

export type ExtractActionFromActionCreator<AC> = AC extends () => infer A
  ? A
  : (AC extends (payload: any) => infer A
      ? A
      : AC extends (payload: any, error: any) => infer A
      ? A
      : never);
