import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { useValues, bInterpolate } from "react-native-redash";
import Haptics from "react-native-haptic-feedback";

import { TextStyles } from "@lib/styles";

const { useCode, greaterOrEq, set, onChange, call, eq, block, cond } = Animated;

export interface PullToRefreshProps {
  scrollY: Animated.Value<number>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ scrollY }) => {
  const [readyToRefresh] = useValues([0], []);

  useCode(
    () =>
      block([
        cond(
          greaterOrEq(scrollY, -100),
          set(readyToRefresh, 1),
          set(readyToRefresh, 0)
        ),
        onChange(
          readyToRefresh,
          cond(
            eq(readyToRefresh, 1),
            call([], () => Haptics.trigger("impactLight"))
          )
        )
      ]),
    []
  );

  const animatedStyle = {
    opacity: scrollY.interpolate({
      inputRange: [-100, 0, 50],
      outputRange: [1, 0, 0]
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: [-20, 0, 0]
        })
      }
    ]
  };

  return (
    <Animated.View style={[styles.loaderContainer, animatedStyle]}>
      <Animated.Text
        style={[
          styles.text,
          TextStyles.large,
          { opacity: bInterpolate(readyToRefresh, 0, 1) }
        ]}
      >
        pull to refresh
      </Animated.Text>
      <Animated.Text
        style={[
          styles.text,
          TextStyles.large,
          { opacity: bInterpolate(readyToRefresh, 1, 0) }
        ]}
      >
        release to refresh
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 40
    // alignItems: "flex"
  },
  text: {
    position: "absolute"
  }
});
