import Animated, { Clock, Easing, Value } from "react-native-reanimated";

import random from "lodash/random";
import { State } from "react-native-gesture-handler";
import { contains, snapPoint, get, min, clamp } from "react-native-redash";
import { SPRING_CONFIG, SCREEN_WIDTH } from "./constants";
import { PartialUser } from "@global";

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
  round,
  divide,
  block,
  startClock,
  stopClock,
  sub,
  add,
  eq,
  abs,
  max: bMax,
  min: bMin,
  greaterThan,
} = Animated;

export const randomColor = () =>
  `rgba(${random(255)}, ${random(255)}, ${random(255)}, 0.4)`;

export const formatName = (user?: PartialUser) =>
  user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "";

export interface WithPagingSnapProps {
  value: Animated.Adaptable<number>;
  velocity: Animated.Adaptable<number>;
  state: Animated.Node<State>;
  snapPoints: Animated.Adaptable<number>[];
  index: Animated.Value<number>;
  offset?: Animated.Value<number>;
}

export const clampednapPoint = (
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

  const point = clampednapPoint(
    index,
    springState.position,
    velocity,
    snapPoints
  );

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
    clamp(springState.position, -SCREEN_WIDTH - 300, 0),
  ]);
};

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

export type WithSnappingScrollParams = {
  value: Animated.Value<number>;
  index: Animated.Value<number>;
  state: Animated.Value<State>;
  velocity: Animated.Value<number>;
  itemHeight: number;
  length: number;
};

export const withSnappingScroll = (props: WithSnappingScrollParams) => {
  const { value, state, velocity, index, itemHeight, length } = props;

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
  const isSpringInterrupted = and(eq(state, State.BEGAN), clockRunning(clock));

  const finishSpring = [
    set(offset, springState.position),
    stopClock(clock),
    set(gestureAndAnimationIsOver, 1),
  ];

  const next = cond(neq(index, length - 1), sub(offset, itemHeight), 0);

  const prev = cond(neq(index, 0), add(offset, itemHeight), 0);

  const point = snapPoint(springState.position, velocity, [next, offset, prev]);

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
        set(index, round(divide(springState.position, -itemHeight))),

        //   springState.position
        // snap complete
      ]),
      // onChange(index, [
      //   //
      //   //
      // ]),
      cond(springState.finished, [
        //   cond(clockRunning(clock), [
        //     set(index, round(divide(springState.position, -itemHeight))),

        //     //   springState.positiontr
        //     // snap complete
        //   ]),
        ...finishSpring,
      ]),
    ]),
    springState.position,
  ]);
};
