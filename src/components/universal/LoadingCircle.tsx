import React from "react";

import Animated from "react-native-reanimated";
import LottieView from "lottie-react-native";

export interface LoadingCircleProps {
  progress: Animated.Node<number>;
}
export const LoadingCircle: React.FC<LoadingCircleProps> = ({ progress }) => {
  return (
    <LottieView
      progress={progress}
      style={{ position: "absolute", marginTop: 10 }}
      source={require("../../assets/lottie/snap-loader-black.json")}
      autoPlay={true}
      loop={true}
    />
  );
};
