import {
  CommentModel,
  FriendRequestModel,
  PostModel,
  UserModel,
} from "./models";

export enum FriendingState {
  FRIENDS = "friends",
  RECEIVED = "received",
  REQUESTED = "requested",
  CAN_FRIEND = "can_friend",
  NONE = "none",
}

export interface FriendRequest extends FriendRequestModel {
  id: string;
  from: string;
  to: string;
}

export type FriendRequest_populated = Omit<FriendRequest, "from" | "to"> & {
  from: User;
  to: User;
};

export interface User extends UserModel {
  id: string;
  friends: string[];
}

export type PartialUser = Pick<User, "id" | "firstName" | "lastName" | "bio">;

export const DefaultUserSchemaFields: (keyof PartialUser)[] = [
  "firstName",
  "lastName",
  "bio",
];

export const CompleteUserSchemaFields: (keyof User)[] = [
  ...DefaultUserSchemaFields,
  "timezone",
  "createdAt",
  "phoneNumber",
];

export const DefaultUserSelect = DefaultUserSchemaFields.join(" ");
export const CompleteUserSelect = CompleteUserSchemaFields.join(" ");

export type User_populated = Omit<User, "friends"> & {
  friends: User[];
};

export type NewUser = Pick<
  User,
  "phoneNumber" | "firstName" | "lastName" | "deviceOS" | "timezone"
>;

export type UserNotificationRecord = {
  _id: string;
  notifications: string[];
};

export interface Post extends PostModel {
  id: string;
  user: string;
}

export type Post_populated = Omit<Post, "user"> & {
  user: User;
};

export type NewPost = Pick<Post, "user" | "description">;

export interface Comment extends CommentModel {
  id: string;
  user: string;
  post: string;
  likes: string[];
}

export type Comment_post_populated = Omit<Comment, "post"> & {
  post: Post;
};

export type Comment_likes_populaed = Omit<Comment, "likes"> & {
  likes: User[];
};

export type Comment_user_populated = Omit<Comment, "user"> & {
  user: User;
};

export type Comment_populated = Omit<Comment, "user" | "likes" | "post"> & {
  post: Post;
  likes: User[];
  user: User;
};

export type NewComment = Pick<Comment, "user" | "body" | "post">;

export type UserNotificationPayload = {
  type: "user";
  route: { phoneNumber: string };
};

export type PostNotificationPayload = {
  type: "post";
  route: { id: string; phoneNumber: string };
};

export type NotificationRoutePayload =
  | UserNotificationPayload
  | PostNotificationPayload;

export type PhotoNotificationPayload = {
  type: "photoTime";
  photoTime: boolean;
  date: string;
};

export type NotificationPayload =
  | NotificationRoutePayload
  | PhotoNotificationPayload;
