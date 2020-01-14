import { User as UserModel, Post as PostModel } from "@unexpected/server";

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
