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
import { SCREEN_HEIGHT, SCREEN_WIDTH, SPRING_CONFIG } from "@lib/constants";
import { TextStyles, Colors } from "@lib/styles";

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
    const [state, value, velocity, offset] = useValues([
      State.UNDETERMINED,
      0,
      0,
      0,
    ]);

    const handler = useGestureHandler({
      state,
      translationX: value,
      velocityX: velocity,
    });

    const translateX = useMemoOne(() => {
      const clock = new Clock();
      const springState: Animated.SpringState = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0),
      };

      const config = {
        toValue: new Value(0),
        ...SPRING_CONFIG,
      };

      const gestureAndAnimationIsOver = new Value(1);
      const isSpringInterrupted = and(
        eq(state, State.BEGAN),
        clockRunning(clock)
      );
      const imperativeChange = and(
        or(
          and(open, neq(springState.position, -SCREEN_WIDTH)),
          and(not(open), neq(springState.position, 0))
        ),
        not(contains([State.ACTIVE, State.BEGAN], state))
      );

      const point = snapPoint(springState.position, velocity, [
        -SCREEN_WIDTH,
        0,
      ]);

      const finishSpring = [
        set(offset, springState.position),
        stopClock(clock),
        set(gestureAndAnimationIsOver, 1),
        set(open, eq(offset, -SCREEN_WIDTH)),
      ];

      return block([
        cond(isSpringInterrupted, finishSpring),
        cond(
          and(gestureAndAnimationIsOver, not(clockRunning(clock))),
          set(springState.position, offset)
        ),
        cond(and(eq(state, State.END), not(gestureAndAnimationIsOver)), [
          cond(and(not(clockRunning(clock)), not(springState.finished)), [
            set(springState.velocity, velocity),
            set(springState.time, 0),
            set(config.toValue, point),
            set(open, eq(point, -SCREEN_WIDTH)),
            startClock(clock),
          ]),
          spring(clock, springState, config),
          cond(springState.finished, finishSpring),
        ]),
        cond(
          imperativeChange,
          [
            startClock(clock),
            set(config.toValue, cond(open, -SCREEN_WIDTH, 0)),
            set(springState.finished, 0),
            cond(
              eq(state, State.ACTIVE),
              [
                set(springState.velocity, velocity),
                set(springState.position, value),
              ],
              [
                spring(clock, springState, config),
                cond(springState.finished, finishSpring),
              ]
            ),
          ],
          cond(neq(state, State.END), [
            set(gestureAndAnimationIsOver, 0),
            set(springState.finished, 0),
            set(springState.position, add(offset, value)),
          ])
        ),
        springState.position,
      ]);
    }, []);

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
