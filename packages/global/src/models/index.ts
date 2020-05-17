export { User as UserModel } from "./user";
export { Post as PostModel } from "./post";
export { Comment as CommentModel } from "./comment";
export { FriendRequest as FriendRequestModel } from "./friend-request";
export { VerificationMessage as VerificationMessageModel } from "./verification-message";

export const _idToId = <T extends { _id: string }>(
  model: T
): Omit<T, "_id"> & { id: string } => {
  const { _id, ...rest } = model;
  return {
    id: _id.toString(),
    ...rest,
  };
};
