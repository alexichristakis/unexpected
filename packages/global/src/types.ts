import {
  FriendRequestModel,
  UserModel,
  PostModel,
  CommentModel,
} from "./models";

export type FriendRequest = Omit<FriendRequestModel, "_id" | "createdAt"> & {
  id: string;
};

export interface User extends UserModel {
  id: string;
}

export interface User_populated extends User {
  friends: User[];
}

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
}

export interface Post_populated extends Post {
  user: User;
}

export type NewPost = Pick<Post, "user" | "description" | "photoId">;

export interface Comment extends CommentModel {
  id: string;
}

export interface Comment_post_populated extends Comment {
  post: Post;
}

export interface Comment_likes_populaed extends Comment {
  likes: User[];
}

export interface Comment_user_populated extends Comment {
  user: User;
}

export type Comment_populated = Comment_post_populated &
  Comment_user_populated &
  Comment_likes_populaed;

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
