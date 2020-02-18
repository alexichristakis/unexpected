import { useFocusEffect } from "@react-navigation/core";
import React from "react";
import { useCallback, useState } from "react";
import { StatusBar } from "react-native";
import Animated, { Easing } from "react-native-reanimated";

import { SB_HEIGHT } from "@lib/styles";
import { useValues } from "react-native-redash";

const { onChange, set, cond, call, greaterThan, useCode } = Animated;

export function hideStatusBarOnScroll(
  scrollY: Animated.Value<number>,
  barStyle: "dark-content" | "light-content"
) {
  const [statusBarVisible, setStatusBarVisible] = useState(true);
  const [translateY, visible] = useValues([0, 1], []);

  useCode(
    () => [
      onChange(
        visible,
        cond(
          visible,
          call([], () => {
            Animated.timing(translateY, {
              toValue: 0,
              duration: 200,
              easing: Easing.ease
            }).start();
            setStatusBarVisible(true);
            StatusBar.setHidden(false, "slide");
          }),
          call([], () => {
            Animated.timing(translateY, {
              toValue: -SB_HEIGHT,
              duration: 200,
              easing: Easing.ease
            }).start();
            setStatusBarVisible(false);
            StatusBar.setHidden(true, "slide");
          })
        )
      ),
      cond(
        greaterThan(scrollY, SB_HEIGHT / 2),
        set(visible, 0),
        set(visible, 1)
      )
    ],
    []
  );

  useFocusEffect(() => {
    StatusBar.setBarStyle(barStyle, true);
    StatusBar.setHidden(!statusBarVisible);

    return () => {};
  });

  const style = {
    transform: [{ translateY }]
  };

  return () => (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: SB_HEIGHT,
          backgroundColor: "white"
        },
        style
      ]}
    />
  );
}
