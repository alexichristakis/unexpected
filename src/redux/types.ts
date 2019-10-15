export interface AppState {
  auth: AuthState;
}

export interface AuthState {
  readonly isRequestingAuth: boolean;
  readonly errorRequestingAuth: any;
  readonly jwt: string | null;
}
