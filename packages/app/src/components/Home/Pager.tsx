import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useCode,
  sub,
} from "react-native-reanimated";
import {
  useGestureHandler,
  useValue,
  useValues,
  contains,
  get,
  min,
  clamp,
  Vector,
} from "react-native-redash";

import { Colors, SCREEN_HEIGHT, SCREEN_WIDTH, withPagingSnap } from "@lib";

import { TabBar } from "./TabBar";
import { ReactiveOverlay } from "./ReactiveOverlay";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "App";

const {
  set,
  Value,
  Clock,
  eq,
  abs,
  and,
  max: bMax,
  min: bMin,
  cond,
  clockRunning,
  not,
  neq,
  multiply,
  or,
  startClock,
  stopClock,
  block,
  add,
  spring,
} = Animated;

export interface PagerProps {
  tab: Animated.Value<number>;
  open: Animated.Value<0 | 1>;
  offset: Vector<Animated.Value<number>>;
  navigation: StackNavigationProp<StackParamList>;
}

export interface WithPagingSnapProps {
  value: Animated.Adaptable<number>;
  velocity: Animated.Adaptable<number>;
  state: Animated.Node<State>;
  snapPoints: Animated.Adaptable<number>[];
  index: Animated.Value<number>;
  offset?: Animated.Value<number>;
}

export const Pager: React.FC<PagerProps> = React.memo(
  ({ tab, open, navigation, offset, children }) => {
    const [velocity, translationX] = useValues(0, 0);
    const state = useValue(State.UNDETERMINED);

    const handler = useGestureHandler({
      state,
      translationX,
      velocityX: velocity,
    });

    const borderTopRightRadius = interpolate(offset.x, {
      inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH, 0],
      outputRange: [20, 1, 1],
      extrapolate: Extrapolate.CLAMP,
    });

    useCode(
      () => [
        set(
          offset.x,
          withPagingSnap({
            state,
            velocity,
            value: translationX,
            index: tab,
            snapPoints: [0, -SCREEN_WIDTH, -SCREEN_WIDTH - 200],
          })
        ),
      ],
      []
    );

    const handleOnPressTab = (index: 0 | 1) => tab.setValue(index);

    const reactiveOverlayStyle = {
      transform: [
        {
          translateX: interpolate(offset.x, {
            inputRange: [-SCREEN_WIDTH - 200, -SCREEN_WIDTH],
            outputRange: [-200, 0],
          }),
        },
      ],
    };

    const yOffsetBorderRadius = interpolate(offset.y, {
      inputRange: [-50, 0],
      outputRange: [20, 1],
      extrapolate: Extrapolate.CLAMP,
    });

    const xOffsetBorderRadius = interpolate(offset.x, {
      inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH],
      outputRange: [20, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    return (
      <PanGestureHandler activeOffsetX={[-10, 10]} {...handler}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              overflow: "hidden",
              borderTopRightRadius,
              borderBottomLeftRadius: yOffsetBorderRadius,
              borderBottomRightRadius: add(
                yOffsetBorderRadius,
                xOffsetBorderRadius
              ),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.container,
              { transform: [{ translateX: offset.x }] },
            ]}
          >
            {children}
          </Animated.View>
          <TabBar
            open={open}
            onPress={handleOnPressTab}
            {...offset}
            {...{ navigation }}
          />
          <ReactiveOverlay
            onPress={() => handleOnPressTab(1)}
            style={reactiveOverlayStyle}
            value={offset.x}
            inputRange={[-SCREEN_WIDTH - 200, -SCREEN_WIDTH]}
            active={eq(tab, 2)}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: 2 * SCREEN_WIDTH,
  },
});
