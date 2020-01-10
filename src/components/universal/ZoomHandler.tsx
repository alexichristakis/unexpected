import React from "react";

import Animated, { Easing } from "react-native-reanimated";
import {
  State,
  PinchGestureHandler,
  PanGestureHandler
} from "react-native-gesture-handler";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";

import {
  onGestureEvent,
  withDecay,
  contains,
  timing,
  useDiff
} from "react-native-redash";

const {
  Value,
  Clock,
  useCode,
  block,
  cond,
  add,
  sub,
  eq,
  set,
  debug,
  call,
  onChange
} = Animated;
const { BEGAN, FAILED, CANCELLED, END, UNDETERMINED } = State;

export interface ZoomHandlerProps {
  children: React.ReactNode;
}

export const ZoomHandler: React.FC<ZoomHandlerProps> = ({ children }) => {
  const pinchRef = React.createRef<PinchGestureHandler>();
  const panRef = React.createRef<PanGestureHandler>();
  const pinchState = new Value(UNDETERMINED);
  const panState = new Value(UNDETERMINED);

  const clock = new Clock();
  const focal = { x: new Value(0), y: new Value(0) };
  const drag = { x: new Value(0), y: new Value(0) };
  const scale = new Value(1);
  const velocity = new Value(0);

  const pinchHandler = onGestureEvent({
    scale,
    velocity,
    state: pinchState,
    focalX: focal.x,
    focalY: focal.y
  });

  const panHandler = onGestureEvent({
    state: panState,
    translationX: drag.x,
    translationY: drag.y
  });

  const animatedStyle = {
    transform: [{ scale }]
  };

  return (
    <PinchGestureHandler ref={pinchRef} {...pinchHandler}>
      <Animated.View>
        <PanGestureHandler
          ref={panRef}
          {...panHandler}
          avgTouches
          minPointers={2}
          minDist={10}
          simultaneousHandlers={pinchRef}
        >
          <Animated.View style={animatedStyle}>{children}</Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </PinchGestureHandler>
  );
};
