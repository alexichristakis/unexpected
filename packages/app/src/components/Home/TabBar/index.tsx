import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useCode,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";
import { mix, useValues, useGestureHandler, clamp } from "react-native-redash";

import {
  TextStyles,
  Colors,
  SCREEN_WIDTH,
  withSpringImperative,
  ACTIVITY_HEIGHT,
} from "@lib";
import ProfileIcon from "@assets/svg/profile.svg";
import FeedIcon from "@assets/svg/feed.svg";

import TabBarIcon from "./Icon";

const { set, divide, onChange, add, cond, eq } = Animated;

export interface TabBarProps {
  open: Animated.Value<0 | 1>;
  onPress: (index: 0 | 1) => void;
  y: Animated.Value<number>;
  x: Animated.Value<number>;
}

export const TabBar: React.FC<TabBarProps> = ({
  open,
  onPress,
  x: xOffset,
  y: yOffset,
}) => {
  const val = divide(xOffset, -SCREEN_WIDTH);

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
        clamp(
          withSpringImperative({
            state,
            value,
            velocity,
            open,
            openOffset: -ACTIVITY_HEIGHT,
            closedOffset: 0,
            snapPoints: [0, -ACTIVITY_HEIGHT],
          }),
          -ACTIVITY_HEIGHT - 100,
          0
        )
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
          <TabBarIcon
            index={0}
            name="Feed"
            icon={{
              component: FeedIcon,
              inactive: Colors.nearBlack,
              active: Colors.purple,
            }}
            backgroundColor={"#ecb3ff"}
            offset={val}
            onPress={handleOnPressFeed}
          />
          <TabBarIcon
            index={1}
            name="Profile"
            icon={{
              component: ProfileIcon,
              inactive: Colors.nearBlack,
              active: Colors.yellow,
            }}
            backgroundColor={"#fffa94"}
            offset={val}
            onPress={handleOnPressProfile}
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
    paddingTop: 12,
    paddingHorizontal: 20,
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
