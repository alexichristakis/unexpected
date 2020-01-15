import Animated, { Easing } from "react-native-reanimated";
import { User } from "@unexpected/global";

export const formatName = (user?: User) =>
  user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "";
