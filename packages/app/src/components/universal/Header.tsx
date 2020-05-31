import React from "react";
import { Animated, StyleSheet } from "react-native";

import { TextStyles } from "@lib";

export interface HeaderProps {
  title: string;
  scrollY: Animated.Value;
}
const Header: React.FC<HeaderProps> = ({ title, scrollY }) => {
  const animatedContainerStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-10, 0, 10],
          outputRange: [10, 0, -20],
          extrapolateRight: "clamp",
        }),
      },
    ],
  };

  const animatedTextStyle = {
    transform: [
      // {
      //   translateY: scrollY.interpolate({
      //     inputRange: [1, 2],
      //     outputRange: [1, 2]
      //   })
      // },
      {
        scale: scrollY.interpolate({
          inputRange: [-5, 1, 10],
          outputRange: [1, 1, 0.9],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.Text style={[styles.text, animatedTextStyle]}>
        {title}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  text: {
    ...TextStyles.large,
  },
});
