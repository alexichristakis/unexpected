import { Post as PostModel, User as UserModel } from "@unexpected/server";

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

export type FeedPost = Post & { user: User };

export type Comment = {
  phoneNumber: string;
  createdAt: string;
  body: string;
};

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
