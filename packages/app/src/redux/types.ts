import { ActionCreatorsMapObject } from "redux";

import { AppState } from "./modules/app";
import { AuthState } from "./modules/auth";
import { ImageState } from "./modules/image";
import { PermissionsState } from "./modules/permissions";
import { PostState } from "./modules/post";
import { UserState } from "./modules/user";
import { CommentState } from "./modules/comment";
import { FriendState } from "./modules/friend";
import { SearchState } from "./modules/search";

import {
  AppActions,
  AuthActions,
  CommentActions,
  FriendActions,
  ImageActions,
  PermissionsActions,
  PostActions,
  UserActions,
  SearchActions,
} from "./modules";

export enum AppActionTypes {
  UPDATE_NAVIGATION = "app/UPDATE_NAVIGATION",
  NAVIGATE = "app/NAVIGATE",
  PROCESS_NOTIFICATION = "app/PROCESS_NOTIFICATION",
  SET_CAMERA_TIMER = "app/SET_CAMERA_TIMER",
  EXPIRE_CAMERA = "app/EXPIRE_CAMERA",
  SET_APP_STATUS = "app/SET_APP_STATUS",
  SET_NET_INFO = "app/SET_NET_INFO",
  NETWORK_OFFLINE = "app/NETWORK_OFFLINE",
  NETWORK_ONLINE = "app/NETWORK_ONLINE",
  DEBUG_ENABLE_CAMERA = "debug/ENABLE_CAMERA",
}

export enum AuthActionTypes {
  REQUEST_AUTH = "auth/REQUEST_AUTH",
  CHECK_CODE = "auth/CHECK_CODE",
  ERROR_REQUESTING_AUTH = "auth/ERROR_REQUESTING_AUTH",
  TEXT_CODE_SUCCESS = "auth/TEXT_CODE_SUCCESS",
  SET_JWT = "auth/SET_JWT",
  RESET = "auth/RESET",
  LOGOUT = "auth/LOGOUT",
}

export enum ImageActionTypes {
  TAKE_PHOTO = "image/TAKE_PHOTO",
  UPLOAD_PROFILE_PHOTO = "image/UPLOAD_PROFILE_PHOTO",
  SUCCESS_UPLOADING_PHOTO = "image/UPLOAD_PHOTO_SUCCESS",
  ERROR = "image/ERROR",
  CACHE_PHOTO = "image/CACHE_PHOTO_SUCCESS",
  REQUEST_CACHE = "image/REQUEST_CACHE",
  CLEAR_PHOTO = "image/CLEAR_PHOTO",
}

export enum PermissionsActionTypes {
  REQUEST_NOTIFICATIONS = "permissions/REQUEST_NOTIFICATIONS",
  SET_NOTIFICATIONS = "permissions/SET_NOTIFICATIONS",
  REQUEST_PERMISSION = "permissions/REQUEST_PERMISSION",
  SET_PERMISSION = "permissions/SET_PERMISSION",
  ERROR_REQUESTING = "permissions/ERROR_REQUESTING",
}

export enum PostActionTypes {
  FETCH_USERS_POSTS = "post/FETCH_USERS_POSTS",
  FETCH_USERS_POSTS_SUCCESS = "post/FETCH_USERS_POSTS_SUCCESS",
  FETCH_FEED = "post/FETCH_FEED",
  FETCH_FEED_SUCCESS = "post/FETCH_FEED_SUCCESS",
  FETCH_POST = "post/FETCH_POST",
  FETCH_POST_SUCCESS = "post/FETCH_POST_SUCCESS",
  SEND_POST = "post/SEND_POST",
  SEND_POST_SUCCESS = "post/SEND_POST_SUCCESS",
  DELETE_POST = "post/DELETE",
  DELETE_POST_SUCCESS = "post/DELETE_SUCCESS",
  POST_ERROR = "post/ERROR",
}

export enum CommentActionTypes {
  SEND_COMMENT = "comment/SEND",
  LOAD_COMMENT = "comment/LOAD",
  LIKE_COMMENT = "comment/LIKE",
  LIKE_COMMENT_SUCCESS = "comment/LIKE_SUCCESS",
  FETCH_COMMENTS = "comment/FETCH",
  FETCH_COMMENTS_SUCCESS = "comment/FETCH_SUCCESS",
  DELETE_COMMENT = "comment/DELETE",
  DELETE_COMMENT_SUCCESS = "comment/DELETE_SUCCESS",
  COMMENT_ERROR = "comment/ERROR",
}

export enum UserActionTypes {
  CREATE_NEW_USER = "user/CREATE_NEW_USER",
  CREATE_USER_SUCCESS = "user/CREATE_USER_SUCCESS",
  FETCH_USER = "user/FETCH_USER",
  FETCH_USERS = "user/FETCH_USERS",
  UPDATE_USER = "user/UPDATE_USER",
  LOAD_USERS = "user/LOAD_USERS",
  USER_ERROR = "user/ERROR",
}

export enum FriendActionTypes {
  FETCH_USERS_REQUESTS = "friend/FETCH_USERS_REQUESTS",
  FETCH_USERS_REQUESTS_SUCCESS = "friend/FETCH_USERS_REQUESTS_SUCCESS",
  FETCH_FRIENDS = "friend/FETCH",
  FETCH_FRIENDS_SUCCESS = "friend/FETCH_SUCCESS",
  FRIEND_USER = "friend/FRIEND",
  FRIEND_USER_SUCCESS = "friend/FRIEND_SUCCESS",
  ACCEPT_REQUEST = "friend/ACCEPT_REQUEST",
  ACCEPT_REQUEST_SUCCESS = "friend/ACCEPT_REQUEST_SUCCESS",
  DELETE_FRIEND = "friend/DELETE",
  DELETE_FRIEND_SUCCESS = "friend/DELETE_SUCCESS",
  DELETE_REQUEST_SUCCESS = "friend/DELETE_REQUEST_SUCCESS",
  FRIEND_ERROR = "friend/ERROR",
}

export enum SearchActionTypes {
  SEARCH = "search/SEARCH",
  SEARCH_SUCCESS = "search/SEARCH_SUCCESS",
}

export const ActionTypes = {
  ...AppActionTypes,
  ...AuthActionTypes,
  ...ImageActionTypes,
  ...PermissionsActionTypes,
  ...PostActionTypes,
  ...UserActionTypes,
  ...CommentActionTypes,
  ...FriendActionTypes,
  ...SearchActionTypes,
};

export type RootState = {
  app: AppState;
  auth: AuthState;
  user: UserState;
  permissions: PermissionsState;
  image: ImageState;
  post: PostState;
  friend: FriendState;
  comment: CommentState;
  search: SearchState;
};

export enum FriendingState {
  FRIENDS = "friends",
  RECEIVED = "received",
  REQUESTED = "requested",
  CAN_FRIEND = "can_friend",
  NONE = "none",
}

export type ActionUnion = ActionsUnion<
  typeof AppActions &
    typeof UserActions &
    typeof PostActions &
    typeof PermissionsActions &
    typeof AuthActions &
    typeof ImageActions &
    typeof FriendActions &
    typeof CommentActions &
    typeof SearchActions
>;

interface Action<T extends string> {
  type: T;
}

interface ActionWithPayload<T extends string, P> extends Action<T> {
  payload: P;
}

export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(
  type: T,
  payload: P
): ActionWithPayload<T, P>;
export function createAction<T extends string, P>(type: T, payload?: P) {
  return payload === undefined ? { type } : { type, payload };
}

export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<
  A[keyof A]
>;

export type ExtractActionFromActionCreator<AC> = AC extends (
  ...args: any[]
) => infer A
  ? A
  : AC extends (payload: any) => infer A
  ? A
  : AC extends (payload: any, error: any) => infer A
  ? A
  : never;

// export type ExtractActionFromActionCreator<AC> = AC extends (...args: any) => infer A ? A
