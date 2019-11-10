import React from "react";

import LottieView from "lottie-react-native";

export const LoadingLine = () => {
  return (
    <LottieView
      style={{ position: "absolute", marginTop: 10, width: "100%" }}
      source={require("../../assets/lottie/loader1.json")}
      autoPlay={true}
      loop={true}
    />
  );
};
