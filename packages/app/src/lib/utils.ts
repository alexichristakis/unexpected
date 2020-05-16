import { User } from "@unexpected/global";
import Animated, { Clock, Easing, Value } from "react-native-reanimated";

import random from "lodash/random";
import { State } from "react-native-gesture-handler";
import { contains, snapPoint } from "react-native-redash";
import { SPRING_CONFIG } from "./constants";

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

export const randomColor = () =>
  `rgba(${random(255)}, ${random(255)}, ${random(255)}, 0.4)`;

export const formatName = (user?: User) =>
  user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "";

export interface WithSpringImperativeParams {
  value: Animated.Adaptable<number>;
  velocity: Animated.Adaptable<number>;
  state: Animated.Node<State>;
  snapPoints: Animated.Adaptable<number>[];
  open: Animated.Value<0 | 1>;
  closedOffset: Animated.Adaptable<number>;
  openOffset: Animated.Adaptable<number>;
  offset?: Animated.Value<number>;
}

export const withSpringImperative = (props: WithSpringImperativeParams) => {
  const {
    value,
    velocity,
    state,
    snapPoints,
    offset,
    open,
    openOffset,
    closedOffset,
  } = {
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
    or(
      and(open, neq(springState.position, openOffset)),
      and(not(open), neq(springState.position, closedOffset))
    ),
    not(contains([State.ACTIVE, State.BEGAN], state))
  );

  const point = snapPoint(springState.position, velocity, snapPoints);

  const finishSpring = [
    set(offset, springState.position),
    stopClock(clock),
    set(gestureAndAnimationIsOver, 1),
    set(open, eq(offset, openOffset)),
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
        set(open, eq(point, openOffset)),
        startClock(clock),
      ]),
      spring(clock, springState, config),
      cond(springState.finished, finishSpring),
    ]),
    cond(
      imperativeChange,
      [
        startClock(clock),
        set(config.toValue, cond(open, openOffset, 0)),
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
