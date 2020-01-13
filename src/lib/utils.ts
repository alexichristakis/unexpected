import Animated, { Easing } from "react-native-reanimated";
import { UserType } from "unexpected-cloud/models/user";

export const formatName = (user?: UserType) =>
  user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "";

// ANIMATION UTILS
