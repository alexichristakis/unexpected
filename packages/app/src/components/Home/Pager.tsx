import React from "react";
import Animated, { useCode, debug } from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { StyleSheet, ViewStyle } from "react-native";
import {
  useValue,
  useGestureHandler,
  useValues,
  withSpring,
} from "react-native-redash";

import {
  SCREEN_WIDTH,
  Colors,
  SCREEN_HEIGHT,
  withSpringImperative,
} from "@lib";
import { SPRING_CONFIG } from "@lib";

const { set } = Animated;

export interface PagerProps {
  style: Animated.AnimateStyle<ViewStyle>;
  tab: Animated.Value<0 | 1>;
  x: Animated.Value<number>;
}

export const Pager: React.FC<PagerProps> = React.memo(
  ({ style, tab, x, children }) => {
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
          withSpringImperative({
            state,
            velocity,
            value: translationX,
            open: tab,
            openOffset: -SCREEN_WIDTH,
            closedOffset: 0,
            snapPoints: [0, -SCREEN_WIDTH, -SCREEN_WIDTH - 100],
          })
        ),
      ],
      []
    );

    return (
      <PanGestureHandler activeOffsetX={[-10, 10]} {...handler}>
        <Animated.View
          style={[styles.container, style, { transform: [{ translateX: x }] }]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: 2 * SCREEN_WIDTH + 100,
    overflow: "hidden",
    // backgroundColor: Colors.background,
  },
});
