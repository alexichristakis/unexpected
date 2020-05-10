import React from "react";
import { StyleSheet } from "react-native";
import Haptics from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";
import { mix, useValues } from "react-native-redash";

import { TextStyles } from "@lib";

const {
  useCode,
  lessOrEq,
  greaterOrEq,
  set,
  onChange,
  call,
  eq,
  block,
  cond,
} = Animated;

export interface PullToRefreshProps {
  scrollY: Animated.Value<number>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ scrollY }) => {
  const [readyToRefresh] = useValues([0], []);

  useCode(
    () =>
      block([
        cond(
          lessOrEq(scrollY, -100),
          set(readyToRefresh, 1),
          set(readyToRefresh, 0)
        ),
        onChange(
          readyToRefresh,
          cond(
            eq(readyToRefresh, 1),
            call([], () => Haptics.trigger("impactLight"))
          )
        ),
      ]),
    []
  );

  const animatedStyle = {
    opacity: scrollY.interpolate({
      inputRange: [-100, 0, 50],
      outputRange: [1, 0, 0],
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: [-20, 0, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.loaderContainer, animatedStyle]}>
      <Animated.Text
        style={[
          styles.text,
          TextStyles.large,
          { opacity: mix(readyToRefresh, 0, 1) },
        ]}
      >
        release to refresh
      </Animated.Text>
      <Animated.Text
        style={[
          styles.text,
          TextStyles.large,
          { opacity: mix(readyToRefresh, 1, 0) },
        ]}
      >
        pull to refresh
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: "absolute",
    left: 15,
    right: 15,
    bottom: 40,
    // alignItems: "flex"
  },
  text: {
    position: "absolute",
  },
});
