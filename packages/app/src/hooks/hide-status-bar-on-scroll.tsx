import { useFocusEffect } from "@react-navigation/core";
import React, { useState } from "react";
import { StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import { withTimingTransition } from "react-native-redash";
import { useValues } from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import { SB_HEIGHT } from "@lib";

const {
  interpolate,
  not,
  or,
  and,
  lessOrEq,
  set,
  cond,
  call,
  greaterThan,
  useCode,
} = Animated;

export interface StatusBarProps {
  onPress: () => void;
}

export function hideStatusBarOnScroll(
  scrollY: Animated.Value<number>,
  barStyle: "dark-content" | "light-content"
) {
  const [statusBarVisible, setStatusBarVisible] = useState(true);
  const [visible] = useValues([1], []);

  const transition = useMemoOne(
    () =>
      withTimingTransition(visible, {
        duration: 200,
        easing: Easing.ease,
      }),
    []
  );

  const translateY = interpolate(transition, {
    inputRange: [0, 1],
    outputRange: [-SB_HEIGHT, 0],
  });

  useCode(
    () => [
      cond(
        or(
          and(greaterThan(scrollY, SB_HEIGHT / 2), visible),
          and(lessOrEq(scrollY, SB_HEIGHT / 2), not(visible))
        ),
        [
          set(visible, not(visible)),
          call([visible], ([visible]) => {
            setStatusBarVisible(!!visible);
            StatusBar.setHidden(!visible, "slide");
          }),
        ]
      ),
    ],
    []
  );

  useFocusEffect(() => {
    StatusBar.setBarStyle(barStyle, true);
    StatusBar.setHidden(!statusBarVisible);

    return () => {};
  });

  const style = {
    backgroundColor: "white",
    transform: [{ translateY }],
  };

  return ({ onPress }: StatusBarProps) => (
    <TouchableOpacity style={styles.statusBar} onPress={onPress}>
      <Animated.View style={[styles.statusBar, style]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: SB_HEIGHT,
  },
});
