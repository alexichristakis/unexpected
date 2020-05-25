import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useCode,
} from "react-native-reanimated";
import {
  clamp,
  mix,
  useGestureHandler,
  useValues,
  Vector,
} from "react-native-redash";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";

import FeedIcon from "@assets/svg/feed.svg";
import ProfileIcon from "@assets/svg/profile.svg";
import {
  ACTIVITY_HEIGHT,
  Colors,
  SCREEN_WIDTH,
  withSpringImperative,
} from "@lib";

import { StackParamList } from "../../../App";
import TabBarIcon from "./Icon";

const { set, divide, onChange, add, cond, eq } = Animated;

export interface TabBarProps {
  navigation: NativeStackNavigationProp<StackParamList>;
  style?: Animated.AnimateStyle<ViewStyle>;
  open: Animated.Value<0 | 1>;
  onPress: (index: 0 | 1) => void;
  offset: Vector<Animated.Value<number>>;
}

export const TabBar: React.FC<TabBarProps> = ({
  navigation,
  open,
  onPress,
  style,
  offset,
}) => {
  const val = divide(offset.x, -SCREEN_WIDTH);

  const [state, tapState] = useValues(State.UNDETERMINED, State.UNDETERMINED);
  const [value, velocity] = useValues(0, 0);

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
        offset.y,
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

  const translateX = interpolate(offset.x, {
    inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH, 0],
    outputRange: [-50, 0, 0],
    extrapolateRight: Extrapolate.CLAMP,
  });

  const handleOnPressFeed = () => onPress(0);
  const handleOnPressProfile = () => onPress(1);

  return (
    <PanGestureHandler activeOffsetY={[-10, 10]} {...handler}>
      <Animated.View
        style={[styles.container, { transform: [{ translateX }] }, style]}
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
        <Animated.View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CAPTURE")}
            style={{ width: 50, height: 50, backgroundColor: "red" }}
          />
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
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
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
