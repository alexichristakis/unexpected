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

const { set, divide, onChange, add, cond, eq } = Animated;

export interface TabBarProps {
  onPress: (index: 0 | 1) => void;
  y: Animated.Value<number>;
  x: Animated.Value<number>;
}

export const TabBar: React.FC<TabBarProps> = ({
  onPress,
  x: xOffset,
  y: yOffset,
}) => {
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

  const yOffsetBorderRadius = interpolate(yOffset, {
    inputRange: [-50, 0],
    outputRange: [20, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const translateX = interpolate(xOffset, {
    inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH, 0],
    outputRange: [-50, 0, 0],
    extrapolateRight: Extrapolate.CLAMP,
  });

  const xOffsetBorderRadius = interpolate(translateX, {
    inputRange: [-50, 0],
    outputRange: [20, 0],
    extrapolate: Extrapolate.CLAMP,
  });

  const handleOnPressFeed = () => onPress(0);
  const handleOnPressProfile = () => onPress(1);

  return (
    <PanGestureHandler activeOffsetY={[-10, 10]} {...handler}>
      <Animated.View
        style={{
          ...styles.container,
          transform: [{ translateX }],
          borderBottomLeftRadius: yOffsetBorderRadius,
          borderBottomRightRadius: add(
            yOffsetBorderRadius,
            xOffsetBorderRadius
          ),
        }}
      >
        <Animated.View style={{ flexDirection: "row" }}>
          <Animated.Text
            onPress={handleOnPressFeed}
            style={[
              TextStyles.medium,
              { marginRight: 10, opacity: mix(val, 1, 0.5) },
            ]}
          >
            feed
          </Animated.Text>
          <Animated.Text
            onPress={handleOnPressProfile}
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
