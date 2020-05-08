import React from "react";
import Animated, { useCode, debug } from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import {
  useValue,
  useGestureHandler,
  useValues,
  withSpring,
} from "react-native-redash";

import { SCREEN_WIDTH, Colors, SCREEN_HEIGHT } from "@lib";
import { SPRING_CONFIG } from "@lib";

const { set } = Animated;

export interface PagerProps {
  x: Animated.Value<number>;
}

export const Pager: React.FC<PagerProps> = React.memo(({ x, children }) => {
  const [velocity, translationX] = useValues([0, 0]);
  const state = useValue(State.UNDETERMINED);

  const handler = useGestureHandler({
    state,
    translationX,
    velocityX: velocity,
  });

  useCode(
    () => [
      set(
        x,
        withSpring({
          state,
          velocity,
          value: translationX,
          snapPoints: [0, -SCREEN_WIDTH],
          config: SPRING_CONFIG,
        })
      ),
    ],
    []
  );

  return (
    <PanGestureHandler activeOffsetX={[-10, 10]} {...handler}>
      <Animated.View
        style={[styles.container, { transform: [{ translateX: x }] }]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: 2 * SCREEN_WIDTH,
    backgroundColor: Colors.background,
  },
});
