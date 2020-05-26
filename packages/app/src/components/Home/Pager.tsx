import React from "react";
import { StyleSheet } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useCode,
} from "react-native-reanimated";
import {
  useGestureHandler,
  useValue,
  useValues,
  Vector,
} from "react-native-redash";

import { SCREEN_WIDTH, withPagingSnap } from "@lib";

import { TabBar } from "./TabBar";
import { ReactiveOverlay } from "./ReactiveOverlay";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "App";

const { set, eq } = Animated;

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

    const xOffsetBorderRadius = interpolate(offset.x, {
      inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH],
      outputRange: [20, 1],
      extrapolate: Extrapolate.CLAMP,
    });

    return (
      <PanGestureHandler activeOffsetX={[-10, 10]} {...handler}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateX: offset.x }],
                borderTopRightRadius: xOffsetBorderRadius,
                borderBottomRightRadius: xOffsetBorderRadius,
              },
            ]}
          >
            {children}
          </Animated.View>

          <TabBar
            open={open}
            onPress={handleOnPressTab}
            style={{ borderBottomRightRadius: xOffsetBorderRadius }}
            {...{ navigation, offset }}
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
    overflow: "hidden",
    width: 2 * SCREEN_WIDTH,
  },
});
