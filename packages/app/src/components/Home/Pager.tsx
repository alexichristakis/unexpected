import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  debug,
  Extrapolate,
  interpolate,
  useCode,
} from "react-native-reanimated";
import {
  useGestureHandler,
  useValue,
  useValues,
  withSpring,
} from "react-native-redash";

import {
  Colors,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  withSpringImperative,
} from "@lib";
import { SPRING_CONFIG } from "@lib";

const { set } = Animated;

export interface PagerProps {
  tab: Animated.Value<0 | 1>;
  x: Animated.Value<number>;
}

export const Pager: React.FC<PagerProps> = React.memo(
  ({ tab, x, children }) => {
    const [velocity, translationX] = useValues([0, 0]);
    const state = useValue(State.UNDETERMINED);

    const handler = useGestureHandler({
      state,
      translationX,
      velocityX: velocity,
    });

    const borderTopRightRadius = interpolate(x, {
      inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH, 0],
      outputRange: [20, 1, 1],
      extrapolate: Extrapolate.CLAMP,
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
          style={[
            styles.container,
            { borderTopRightRadius, transform: [{ translateX: x }] },
          ]}
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
