import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";

import { SCREEN_WIDTH, TextStyles } from "@lib/styles";

export interface FeedTopProps {
  scrollY: Animated.Value<number>;
}
export const Top: React.FC<FeedTopProps> = ({ scrollY }) => {
  const animatedStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: [-50, 0, 0]
        })
      }
    ]
  };

  const animatedHeaderStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 100, 200],
          outputRange: [-200, -100, 100, 200]
        })
      }
    ]
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={TextStyles.title}>Today</Text>
      <Text style={TextStyles.large}>Monday, November 25th</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    // flexDirection: "row",
    // alignItems: "center",
    paddingVertical: 20
  },
  row: {
    alignSelf: "stretch",
    // alignItems: "flex-start",
    // justifyContent: "space-around",
    flexDirection: "row",
    flex: 1
    // marginBottom: 20
  },
  bio: {
    flex: 1,
    // justifyContent: "space-around",
    marginLeft: 20
  },
  header: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: "center"
  }
});
