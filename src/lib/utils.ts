import { UserType } from "unexpected-cloud/models/user";

export const formatName = (user: UserType) =>
  `${user.firstName} ${user.lastName}`;
