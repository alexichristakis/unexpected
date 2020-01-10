import React from "react";
import ReactNative, { UIManager } from "react-native";

import Animated, { Easing } from "react-native-reanimated";
import {
  State,
  PinchGestureHandler,
  PanGestureHandler
} from "react-native-gesture-handler";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";
import {
  bouncy,
  bouncyPinch,
  scaleDiff,
  scaleFriction,
  scaleRest,
  dragDiff,
  friction,
  speed
} from "@lib/utils";

import {
  onGestureEvent,
  withDecay,
  contains,
  timing,
  useDiff,
  bInterpolate,
  useValues
} from "react-native-redash";
import { FocusedImageType, Measurement } from "@components/Feed";

const {
  Value,
  divide,
  lessThan,
  multiply,
  Clock,
  or,
  max,
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
const { BEGAN, ACTIVE, FAILED, CANCELLED, END, UNDETERMINED } = State;

export type ZoomHandlerGestureBeganPayload = {
  measurement: Measurement;
  transform: {
    [key: string]: Animated.Node<number>;
  }[];
};

const WIDTH = SCREEN_WIDTH - 40;
const HEIGHT = 1.2 * (SCREEN_WIDTH - 40);

export interface ZoomHandlerProps {
  children: React.ReactNode;
  onGestureBegan: (payload: ZoomHandlerGestureBeganPayload) => void;
}

export const ZoomHandler: React.FC<ZoomHandlerProps> = React.memo(
  ({ children, onGestureBegan }) => {
    const pinchRef = React.createRef<PinchGestureHandler>();
    const panRef = React.createRef<PanGestureHandler>();
    const childRef = React.createRef<Animated.View>();

    const [pinchState, panState] = useValues([UNDETERMINED, UNDETERMINED], []);

    const pinchActive = eq(pinchState, ACTIVE);
    const panActive = eq(panState, ACTIVE);

    const clock = new Clock();

    const [
      dragX,
      dragY,
      panTransX,
      panTransY,
      focalX,
      focalY,
      focalDisplacementX,
      focalDisplacementY,
      pinchScale,
      scaleVal
    ] = useValues([0, 0, 0, 0, 0, 0, 0, 0, 1, 1], []);

    const relativeFocalX = sub(focalX, add(dragX, focalDisplacementX));
    const relativeFocalY = sub(focalY, add(dragY, focalDisplacementY));

    const scale = set(
      scaleVal,
      bouncyPinch(
        scaleVal,
        pinchScale,
        pinchActive,
        relativeFocalX,
        focalDisplacementX,
        relativeFocalY,
        focalDisplacementY
      )
    );

    const panFriction = (value: Animated.Node<number>) => friction(value);

    const panUpY = cond(
      lessThan(scale, 1),
      0,
      multiply(-1, focalDisplacementY)
    );
    const panLowY = add(panUpY, multiply(-HEIGHT, add(max(1, scale), -1)));

    const translateY = set(
      panTransY,
      bouncy(
        panTransY,
        dragDiff(dragY, panActive),
        or(panActive, pinchActive),
        panLowY,
        panUpY,
        panFriction
      )
    );

    const panUpX = cond(
      lessThan(scale, 1),
      0,
      multiply(-1, focalDisplacementX)
    );
    const panLowX = add(panUpX, multiply(-WIDTH, add(max(1, scale), -1)));

    const translateX = set(
      panTransX,
      bouncy(
        panTransX,
        dragDiff(dragX, panActive),
        or(panActive, pinchActive),
        panLowX,
        panUpX,
        panFriction
      )
    );

    const scaleTopLeftFixX = divide(multiply(WIDTH, add(scale, -1)), 2);
    const scaleTopLeftFixY = divide(multiply(HEIGHT, add(scale, -1)), 2);

    useCode(
      () =>
        block([
          cond(contains([pinchState, panState], BEGAN), [
            call([], () => {
              if (childRef.current)
                UIManager.measure(
                  ReactNative.findNodeHandle(childRef.current)!,
                  (x, y, width, height, pageX, pageY) => {
                    onGestureBegan({
                      transform: [
                        { scale },
                        { translateY },
                        { translateX },
                        { translateY: scaleTopLeftFixY },
                        { translateX: scaleTopLeftFixX },
                        { translateY: focalDisplacementY },
                        { translateX: focalDisplacementX }
                      ],
                      measurement: { x: pageX, y: pageY, w: width, h: height }
                    });
                  }
                );
            })
          ])
        ]),
      []
    );

    const pinchHandler = onGestureEvent({
      scale: pinchScale,
      state: pinchState,
      focalX: focalX,
      focalY: focalY
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
            <Animated.View
              ref={childRef}
              style={{
                opacity: cond(contains([pinchState, panState], ACTIVE), 0, 1)
              }}
            >
              {children}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    );
  },
  () => true
);
