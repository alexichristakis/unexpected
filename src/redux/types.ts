export interface AuthState {
  isRequestingAuth: boolean;
  errorRequestingAuth: any;
  jwt: string | null;
}

export const REQUEST_AUTH = 'REQUEST_AUTH';
export interface RequestAuthAction {
  type: typeof REQUEST_AUTH;
}

export const LOAD_JWT = 'LOAD_JWT';
export interface LoadJwtAction {
  type: typeof LOAD_JWT;
  jwt: string;
}

export type AuthActionTypes = LoadJwtAction | RequestAuthAction;
