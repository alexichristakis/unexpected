import React from "react";
import ReactNative, { UIManager } from "react-native";

import Animated, { Easing } from "react-native-reanimated";
import {
  State,
  PinchGestureHandler,
  PanGestureHandler
} from "react-native-gesture-handler";
import { delay } from "react-native-redash";

import {
  onGestureEvent,
  withDecay,
  contains,
  timing,
  useDiff,
  bInterpolate,
  useValues
} from "react-native-redash";
import { ZoomedImage, Measurement } from "@components/universal";

const {
  or,
  and,
  not,
  useCode,
  block,
  cond,
  eq,
  set,
  call,
  onChange,
  debug
} = Animated;
const { BEGAN, ACTIVE, FAILED, CANCELLED, END, UNDETERMINED } = State;

export type ZoomHandlerGestureBeganPayload = {
  measurement: Measurement;
  scale: Animated.Value<number>;
  translateX: Animated.Value<number>;
  translateY: Animated.Value<number>;
};

export interface ZoomHandlerProps {
  children: React.ReactNode;
  onGestureBegan: (payload: ZoomHandlerGestureBeganPayload) => void;
  onGestureComplete: () => void;
}

export const ZoomHandler: React.FC<ZoomHandlerProps> = React.memo(
  ({ children, onGestureBegan, onGestureComplete }) => {
    const pinchRef = React.createRef<PinchGestureHandler>();
    const panRef = React.createRef<PanGestureHandler>();
    const childRef = React.createRef<Animated.View>();

    const [pinchState, panState, dragX, dragY, scale, opacity] = useValues(
      [UNDETERMINED, UNDETERMINED, 0, 0, 1, 1],
      []
    );

    const pinchActive = or(eq(pinchState, ACTIVE), eq(pinchState, BEGAN));
    const panActive = or(eq(panState, ACTIVE), eq(panState, BEGAN));

    const duration = 250;
    const easing = Easing.inOut(Easing.ease);

    useCode(
      () =>
        block([
          cond(contains([pinchState, panState], BEGAN), [
            call([], () => {
              if (childRef.current) {
                UIManager.measure(
                  ReactNative.findNodeHandle(childRef.current)!,
                  (x, y, width, height, pageX, pageY) => {
                    onGestureBegan({
                      scale,
                      translateY: dragY,
                      translateX: dragX,
                      measurement: { x: pageX, y: pageY, w: width, h: height }
                    });
                    opacity.setValue(0);
                  }
                );
              }
            })
          ]),
          cond(and(not(pinchActive), not(panActive)), [
            set(scale, timing({ to: 1, from: scale, duration, easing })),
            set(dragX, timing({ to: 0, from: dragX, duration, easing })),
            set(dragY, timing({ to: 0, from: dragY, duration, easing })),
            delay(set(opacity, 1), duration),
            delay(
              call([], () => {
                onGestureComplete();
              }),
              duration
            )
          ])
        ]),
      []
    );

    const pinchHandler = onGestureEvent({
      scale,
      state: pinchState
    });

    const panHandler = onGestureEvent({
      state: panState,
      translationX: dragX,
      translationY: dragY
    });

    return (
      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={panRef}
        {...pinchHandler}
      >
        <Animated.View>
          <PanGestureHandler
            ref={panRef}
            avgTouches
            minPointers={2}
            minDist={10}
            simultaneousHandlers={pinchRef}
            {...panHandler}
          >
            <Animated.View ref={childRef} style={{ opacity }}>
              {children}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    );
  },
  () => true
);
