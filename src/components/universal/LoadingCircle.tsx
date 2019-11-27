import React from "react";

import LottieView from "lottie-react-native";
import Animated from "react-native-reanimated";

export interface LoadingCircleProps {
  loop: boolean;
  progress: Animated.Node<number>;
}
export const LoadingCircle: React.FC<LoadingCircleProps> = ({
  progress,
  loop
}) => {
  return (
    <LottieView
      loop={loop}
      progress={loop ? undefined : progress}
      style={{ position: "absolute", marginTop: 10 }}
      source={require("../../assets/lottie/snap-loader-black.json")}
      autoPlay={true}
    />
  );
};
