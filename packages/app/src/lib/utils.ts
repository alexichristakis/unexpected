import { User } from "@unexpected/global";
import Animated, { Easing } from "react-native-reanimated";

export const formatName = (user?: User) =>
  user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "";
