import React, { useCallback, useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import Animated, {
  useCode,
  debug,
  Value,
  Clock,
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
  min,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SPRING_CONFIG, Colors } from "@lib";
import Swipeable from "./Swipeable";
import Post, { POST_HEIGHT } from "@components/Post";
import random from "lodash/random";
import { TextStyles } from "@lib";

import Header from "./Header";

const {
  onChange,
  cond,
  abs,
  modulo,
  divide,
  round,
  multiply,
  set,
  and,
  clockRunning,
  not,
  neq,
  call,
  block,
  startClock,
  stopClock,
  spring,
  sub,
  add,
  eq,
  lessThan,
  greaterThan,
} = Animated;

const connector = connect(
  (state: RootState) => ({ postIds: selectors.allPosts(state) }),
  {}
);

export interface FeedProps {}

export type FeedConnectedProps = ConnectedProps<typeof connector>;

const Feed: React.FC<FeedProps & FeedConnectedProps> = ({ postIds }) => {
  const state = useValue(State.UNDETERMINED);
  const [value, velocity, index] = useValues<number>([0, 0, 0]);

  const handler = useGestureHandler({
    state,
    translationY: value,
    velocityY: velocity,
  });

  const translateY = useMemoOne(() => {
    const clock = new Clock();
    const offset = new Value(0);
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

    const finishSpring = [
      set(offset, springState.position),
      stopClock(clock),
      set(gestureAndAnimationIsOver, 1),
    ];

    const next = cond(
      neq(index, postIds.length - 1),
      sub(offset, POST_HEIGHT),
      0
    );
    const prev = cond(neq(index, 0), add(offset, POST_HEIGHT), 0);

    const point = snapPoint(springState.position, velocity, [
      next,
      offset,
      prev,
    ]);

    return block([
      cond(isSpringInterrupted, finishSpring),
      cond(gestureAndAnimationIsOver, set(springState.position, offset)),
      cond(neq(state, State.END), [
        set(gestureAndAnimationIsOver, 0),
        set(springState.finished, 0),
        set(springState.position, add(offset, value)),
      ]),
      cond(and(eq(state, State.END), not(gestureAndAnimationIsOver)), [
        cond(and(not(clockRunning(clock)), not(springState.finished)), [
          set(springState.velocity, velocity),
          set(springState.time, 0),
          set(config.toValue, point),
          startClock(clock),
        ]),
        spring(clock, springState, config),
        cond(clockRunning(clock), [
          set(index, round(divide(springState.position, -POST_HEIGHT))),

          //   springState.position
          // snap complete
        ]),
        // onChange(index, [
        //   //
        //   //
        // ]),
        cond(springState.finished, [
          //   cond(clockRunning(clock), [
          //     set(index, round(divide(springState.position, -POST_HEIGHT))),

          //     //   springState.position
          //     // snap complete
          //   ]),
          ...finishSpring,
        ]),
      ]),
      springState.position,
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <PanGestureHandler activeOffsetY={[-10, 10]} {...handler}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          {postIds.map((id, key) => (
            <Post
              visible={eq(index, key)}
              dragStarted={eq(state, State.BEGAN)}
              offset={sub(translateY, key * -POST_HEIGHT)}
              {...{ id, key }}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>
      <Header offset={translateY} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: Colors.background,
    paddingTop: 150,
  },
});

export default connector(Feed);
