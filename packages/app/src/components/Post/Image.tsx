import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import Animated, {
  useCode,
  debug,
  Value,
  Clock,
  interpolate,
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useGestureHandler,
  useValue,
  useValues,
  //   withSpring,
  WithSpringParams,
  snapPoint,
  useClock,
  withSpring,
  // spring,
  withSpringTransition,
  contains,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SPRING_CONFIG } from "@lib";
import { TextStyles, Colors } from "@lib";
import { withSpringImperative } from "@lib";

import Comments from "./Comments";
import random from "lodash/random";

const {
  cond,
  or,
  set,
  and,
  clockRunning,
  not,
  multiply,
  spring,
  neq,
  call,
  block,
  startClock,
  stopClock,
  sub,
  add,
  eq,
  greaterThan,
} = Animated;

const randomColor = () =>
  `rgba(${random(255)}, ${random(255)}, ${random(255)}, 0.4)`;

const connector = connect((state: RootState) => ({}), {});

export interface ImageProps {
  open: Animated.Value<0 | 1>;
  children: ({
    translateX,
  }: {
    translateX: Animated.Node<number>;
  }) => JSX.Element;
}

export type PostConnectedProps = ConnectedProps<typeof connector>;

const Image: React.FC<ImageProps & PostConnectedProps> = React.memo(
  ({ children, open }) => {
    const [state, value, velocity] = useValues([State.UNDETERMINED, 0, 0]);

    const handler = useGestureHandler({
      state,
      translationX: value,
      velocityX: velocity,
    });

    const translateX = useMemoOne(
      () =>
        withSpringImperative({
          value,
          velocity,
          state,
          open,
          snapPoints: [0, -SCREEN_WIDTH],
          openOffset: -SCREEN_WIDTH,
          closedOffset: 0,
        }),
      []
    );

    const scale = interpolate(translateX, {
      inputRange: [-SCREEN_WIDTH, 0],
      outputRange: [0.9, 1],
    });

    return (
      <PanGestureHandler {...handler} activeOffsetX={[-10, 10]}>
        <Animated.View style={styles.container}>
          <Animated.View
            style={[
              styles.image,
              { transform: [{ scale }], backgroundColor: randomColor() },
            ]}
          />
          {children({ translateX })}
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    height: 450,
    flexDirection: "row",
  },
  image: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 20,
    height: 450,
  },
});

export default connector(Image);
