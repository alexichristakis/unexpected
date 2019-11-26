import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";

import { LoadingCircle } from "@components/universal";
import { SCREEN_WIDTH, TextStyles } from "@lib/styles";

const {
  Value,
  block,
  cond,
  set,
  sub,
  onChange,
  call,
  and,
  lessThan,
  greaterOrEq,
  useCode
} = Animated;

export interface RefreshControlProps {
  //   onRefresh: () => void;
  refreshing: boolean;
  scrollY: Animated.Value<number>;
}
export const RefreshControl: React.FC<RefreshControlProps> = ({
  scrollY,
  refreshing
}) => {
  //   const [offset] = useState(new Animated.Value(0));

  const animatedLoaderStyle = {
    opacity: scrollY.interpolate({
      inputRange: [-100, 0, 50],
      outputRange: [1, 0, 0]
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: [-35, 0, 50]
        })
      }
    ]
  };

  return (
    <Animated.View style={[styles.loaderContainer, animatedLoaderStyle]}>
      <LoadingCircle
        loop={refreshing}
        progress={scrollY.interpolate({
          inputRange: [-100, 0],
          outputRange: [1, 0]
        })}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    backgroundColor: "white",
    paddingVertical: 20
  },
  loaderContainer: {
    position: "absolute",
    height: 100,
    top: 0,
    left: 0,
    right: 0
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    flex: 1
  },
  bio: {
    flex: 1,
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
