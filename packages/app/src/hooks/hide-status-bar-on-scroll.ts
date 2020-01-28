import { useFocusEffect } from "@react-navigation/core";
import { useCallback, useState } from "react";
import { StatusBar } from "react-native";
import Animated, { Easing } from "react-native-reanimated";

import { SB_HEIGHT } from "@lib/styles";

const { Value, block, cond, call, greaterOrEq, useCode } = Animated;

export function hideStatusBarOnScroll(scrollY: Animated.Value<number>) {
  const [statusBarVisible, setStatusBarVisible] = useState(true);
  const [statusBarAnimatedValue] = useState(new Value(0));

  const showStatusBar = () => {
    if (!statusBarVisible) {
      setStatusBarVisible(true);
      StatusBar.setHidden(false, "slide");

      Animated.timing(statusBarAnimatedValue, {
        toValue: 0,
        duration: 150,
        easing: Easing.ease
      }).start();
    }
  };

  const hideStatusBar = () => {
    if (statusBarVisible) {
      setStatusBarVisible(false);
      StatusBar.setHidden(true, "slide");

      Animated.timing(statusBarAnimatedValue, {
        toValue: -SB_HEIGHT(),
        duration: 150,
        easing: Easing.ease
      }).start();
    }
  };

  useCode(
    () =>
      block([
        cond(
          greaterOrEq(scrollY, 40),
          call([], hideStatusBar),
          call([], showStatusBar)
        )
      ]),
    [statusBarVisible]
  );

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(!statusBarVisible);

      return () => {};
    }, [statusBarVisible])
  );

  return {
    transform: [{ translateY: statusBarAnimatedValue }]
  };
}
