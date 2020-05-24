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
} from "react-native-redash";

import { Colors, SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib";
import { SPRING_CONFIG } from "@lib";

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
  x: Animated.Value<number>;
}

export interface WithPagingSnapProps {
  value: Animated.Adaptable<number>;
  velocity: Animated.Adaptable<number>;
  state: Animated.Node<State>;
  snapPoints: Animated.Adaptable<number>[];
  index: Animated.Value<number>;
  offset?: Animated.Value<number>;
}

const snapPoint = (
  index: Animated.Value<number>,
  value: Animated.Adaptable<number>,
  velocity: Animated.Adaptable<number>,
  points: Animated.Adaptable<number>[]
) => {
  const point = add(value, multiply(0.2, velocity));

  const diffPoint = (p: Animated.Adaptable<number>) => abs(sub(point, p));

  const deltas = points.map((p) => diffPoint(p));
  const minDelta = min(...deltas);

  const nextIndex = clamp(
    points.reduce(
      (acc, p, i) => cond(eq(diffPoint(p), minDelta), i, acc),
      new Value()
    ) as Animated.Node<number>,
    bMax(0, sub(index, 1)),
    bMin(points.length - 1, add(index, 1))
  );

  return get(points, set(index, nextIndex));
};

export const withPagingSnap = (props: WithPagingSnapProps) => {
  const { value, velocity, state, snapPoints, offset, index } = {
    offset: new Value(0),
    ...props,
  };

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
  const isSpringInterrupted = and(eq(state, State.BEGAN), clockRunning(clock));
  const imperativeChange = and(
    neq(get(snapPoints, index), springState.position),
    not(contains([State.ACTIVE, State.BEGAN], state))
  );

  const point = snapPoint(index, springState.position, velocity, snapPoints);

  const finishSpring = [
    set(offset, springState.position),
    stopClock(clock),
    set(gestureAndAnimationIsOver, 1),
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
        startClock(clock),
      ]),
      spring(clock, springState, config),
      cond(springState.finished, finishSpring),
    ]),
    cond(
      imperativeChange,
      [
        startClock(clock),
        set(config.toValue, get(snapPoints, index)),
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
};

export const Pager: React.FC<PagerProps> = React.memo(
  ({ tab, x, children }) => {
    const [velocity, translationX] = useValues(0, 0);
    const state = useValue(State.UNDETERMINED);

    const handler = useGestureHandler({
      state,
      translationX,
      velocityX: velocity,
    });

    const borderTopRightRadius = interpolate(x, {
      inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH, 0],
      outputRange: [20, 1, 1],
      extrapolate: Extrapolate.CLAMP,
    });

    useCode(
      () => [
        set(
          x,
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

    return (
      <PanGestureHandler activeOffsetX={[-10, 10]} {...handler}>
        <Animated.View
          style={[
            styles.container,
            { borderTopRightRadius, transform: [{ translateX: x }] },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: 2 * SCREEN_WIDTH + 100,
    overflow: "hidden",
    // backgroundColor: Colors.background,
  },
});
