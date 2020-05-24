import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, { Clock, Value } from "react-native-reanimated";
import {
  min,
  snapPoint,
  useClock,
  //   withSpring,
  useGestureHandler,
  useValue,
  useValues,
  withSpring,
  WithSpringParams,
} from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import { useMemoOne } from "use-memo-one";

import Post, { POST_HEIGHT } from "@components/Post";
import { Colors, SPRING_CONFIG } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PostActions } from "@redux/modules";

import Header from "./Header";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "App";

const {
  onChange,
  cond,
  abs,
  modulo,
  divide,
  lessThan,
  round,
  multiply,
  set,
  and,
  clockRunning,
  not,
  neq,
  block,
  startClock,
  stopClock,
  spring,
  sub,
  add,
  eq,
} = Animated;

const connector = connect(
  (state: RootState) => ({ postIds: selectors.feed(state) }),
  { fetchFeed: PostActions.fetchFeed }
);

export interface FeedProps {
  navigation: StackNavigationProp<StackParamList>;
}

export type FeedConnectedProps = ConnectedProps<typeof connector>;

const Feed: React.FC<FeedProps & FeedConnectedProps> = ({
  navigation,
  postIds,
  fetchFeed,
}) => {
  const state = useValue(State.UNDETERMINED);
  const [value, velocity, index] = useValues<number>(0, 0, 0);

  useEffect(() => {
    fetchFeed();
  }, []);

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
        <Animated.View
          style={{
            height: postIds.length * POST_HEIGHT,
            transform: [{ translateY }],
          }}
        >
          {postIds.map((id, key) => (
            <Post
              inViewbox={lessThan(abs(sub(key, index)), 3)}
              focused={eq(index, key)}
              dragStarted={eq(state, State.BEGAN)}
              offset={sub(translateY, key * -POST_HEIGHT)}
              {...{ id, key }}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>
      <Header navigation={navigation} offset={translateY} />
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
