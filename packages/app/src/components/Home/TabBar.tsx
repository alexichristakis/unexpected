import React from "react";
import Animated, {
  useCode,
  debug,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  mix,
  useValue,
  useValues,
  useGestureHandler,
  withSpring,
  Vector,
} from "react-native-redash";
import { StyleSheet, ViewStyle } from "react-native";

import { SCREEN_WIDTH, SPRING_CONFIG } from "@lib/constants";
import { SB_HEIGHT, TextStyles, Colors } from "@lib/styles";
import { useMemoOne } from "use-memo-one";

const { set, divide } = Animated;

export interface TabBarProps {
  y: Animated.Value<number>;
  x: Animated.Value<number>;
}

export const TabBar: React.FC<TabBarProps> = ({ x: xOffset, y: yOffset }) => {
  const val = divide(xOffset, -SCREEN_WIDTH);

  const [state, value, velocity] = useValues([State.UNDETERMINED, 0, 0]);

  const handler = useGestureHandler({
    state,
    translationY: value,
    velocityY: velocity,
  });

  useCode(
    () => [
      set(
        yOffset,
        withSpring({
          state,
          value,
          velocity,
          snapPoints: [0, -500],
          config: SPRING_CONFIG,
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
    <PanGestureHandler {...handler}>
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
        <Animated.View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "blue",
          }}
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    // position: "absolute",
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
