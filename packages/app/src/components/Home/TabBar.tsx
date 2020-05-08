import React from "react";
import Animated, {
  useCode,
  debug,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import {
  mix,
  useValue,
  useValues,
  useGestureHandler,
  withSpring,
  Vector,
} from "react-native-redash";
import { StyleSheet, ViewStyle } from "react-native";

import {
  TextStyles,
  Colors,
  SCREEN_WIDTH,
  SPRING_CONFIG,
  withSpringImperative,
} from "@lib";
import { useMemoOne } from "use-memo-one";

const { set, divide, onChange, cond, eq } = Animated;

export interface TabBarProps {
  y: Animated.Value<number>;
  x: Animated.Value<number>;
}

export const TabBar: React.FC<TabBarProps> = ({ x: xOffset, y: yOffset }) => {
  const val = divide(xOffset, -SCREEN_WIDTH);

  const open = useValue<0 | 1>(0);
  const [state, tapState] = useValues([State.UNDETERMINED, State.UNDETERMINED]);
  const [value, velocity] = useValues([0, 0]);

  const handler = useGestureHandler({
    state,
    translationY: value,
    velocityY: velocity,
  });

  const tapHandler = useGestureHandler({
    state: tapState,
  });

  useCode(
    () => [
      onChange(
        tapState,
        cond(eq(tapState, State.END), [
          cond(open, [set(open, 0)], [set(open, 1)]),
        ])
      ),
      set(
        yOffset,
        withSpringImperative({
          state,
          value,
          velocity,
          open,
          openOffset: -500,
          closedOffset: 0,
          snapPoints: [0, -500],
        })
      ),
    ],
    []
  );

  const borderRadius = interpolate(yOffset, {
    inputRange: [-300, 0],
    outputRange: [20, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  return (
    <PanGestureHandler activeOffsetY={[-10, 10]} {...handler}>
      <Animated.View
        style={{
          ...styles.container,
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
        }}
      >
        <Animated.View style={{ flexDirection: "row" }}>
          <Animated.Text
            style={[
              TextStyles.medium,
              { marginRight: 10, opacity: mix(val, 1, 0.5) },
            ]}
          >
            feed
          </Animated.Text>
          <Animated.Text
            style={[TextStyles.medium, { opacity: mix(val, 0.5, 1) }]}
          >
            profile
          </Animated.Text>
          <Animated.View
            style={{
              ...styles.indicator,
              transform: [{ translateX: mix(val, 0, 50) }],
            }}
          />
        </Animated.View>
        <TapGestureHandler {...tapHandler}>
          <Animated.View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "blue",
            }}
          />
        </TapGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "space-between",
    paddingTop: 15,
    paddingHorizontal: 30,
    height: 80,
    flexDirection: "row",
    backgroundColor: Colors.background,
  },
  indicator: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.nearBlack,
    left: 15,
    top: 28,
  },
});
