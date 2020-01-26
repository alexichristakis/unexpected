import {
  Comment as CommentModel,
  Post as PostModel,
  User as UserModel,
  FriendRequest as FriendRequestModel
} from "@unexpected/server";

export type FriendRequest = Omit<FriendRequestModel, "_id" | "createdAt"> & {
  id: string;
};

export type NewUser = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
};

export type User = Omit<UserModel, "_id" | "createdAt">;

export type UserNotificationRecord = {
  phoneNumber: string;
  notifications: string[];
};

export type Post = Omit<PostModel, "_id"> & { id: string };

export type FeedPost = Post & { user: User; comments: Comment[] };

export type Comment = Omit<CommentModel, "_id"> & { id: string };
export type NewComment = Omit<Comment, "createdAt" | "id">;

export type UserNotificationPayload = {
  type: "user";
  route: User;
};

export type PostNotificationPayload = {
  type: "post";
  route: Post;
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
