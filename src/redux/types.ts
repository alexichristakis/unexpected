export interface AppState {
  auth: AuthState;
}

export interface AuthState {
  readonly loading: boolean;
  readonly isAwaitingCode: boolean;
  readonly authError: any;
  readonly jwt: string | null;
}
