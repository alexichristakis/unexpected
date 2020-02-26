import React from "react";
import { findNodeHandle, UIManager } from "react-native";

import {
  PanGestureHandler,
  PinchGestureHandler,
  State
} from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";
import {
  contains,
  onGestureEvent,
  timing,
  useClocks,
  useValues
} from "react-native-redash";

import { Measurement } from "@components/universal";

const {
  clockRunning,
  max,
  useCode,
  and,
  not,
  or,
  eq,
  debug,
  set,
  divide,
  block,
  cond,
  call
} = Animated;
const { BEGAN, ACTIVE, UNDETERMINED } = State;

export type ZoomHandlerGestureBeganPayload = {
  measurement: Measurement;
  scale: Animated.Adaptable<number>;
  translateX: Animated.Adaptable<number>;
  translateY: Animated.Adaptable<number>;
};

export interface ZoomHandlerProps {
  children: React.ReactNode;
  renderKey?: string;
  onGestureBegan: (payload: ZoomHandlerGestureBeganPayload) => void;
  onGestureComplete: () => void;
}

export const ZoomHandler: React.FC<ZoomHandlerProps> = React.memo(
  ({ children, onGestureBegan, onGestureComplete, renderKey = "" }) => {
    const pinchRef = React.createRef<PinchGestureHandler>();
    const panRef = React.createRef<PanGestureHandler>();
    const childRef = React.createRef<Animated.View>();

    const [pinchClock, xClock, yClock] = useClocks(3, []);

    const [pinchState, panState] = useValues<State>(
      [UNDETERMINED, UNDETERMINED],
      []
    );

    const pinchActive = or(eq(pinchState, ACTIVE), eq(pinchState, BEGAN));
    const panActive = or(eq(panState, ACTIVE), eq(panState, BEGAN));

    const [
      dragX,
      dragY,
      velocityY,
      velocityX,
      pinch,
      pinchVelocity,
      opacity
    ] = useValues<number>([0, 0, 0, 0, 1, 0, 1], []);

    const duration = 200;
    const easing = Easing.inOut(Easing.ease);

    const scale = max(pinch, 1);
    const translateY = divide(dragY, scale);
    const translateX = divide(dragX, scale);

    const handleOnBegan = () => {
      if (childRef.current) {
        UIManager.measure(
          findNodeHandle(childRef.current)!,
          (_, __, width, height, pageX, pageY) => {
            // send animated values and measurements to <ZoomedImage />
            onGestureBegan({
              scale,
              translateX,
              translateY,
              measurement: { x: pageX, y: pageY, w: width, h: height }
            });

            // hide the original image
            opacity.setValue(0);
          }
        );
      }
    };

    const clocksNotRunning = and(
      not(clockRunning(pinchClock)),
      not(clockRunning(xClock)),
      not(clockRunning(yClock))
    );

    const resetNode = (
      node: Animated.Value<number>,
      clock: Animated.Clock,
      to: number
    ) =>
      set(
        node,
        timing({
          from: node,
          to,
          clock,
          duration,
          easing
        })
      );

    useCode(
      () => [
        cond(contains([pinchState, panState], BEGAN), call([], handleOnBegan)),
        cond(and(not(pinchActive), not(panActive)), [
          resetNode(pinch, pinchClock, 1),
          resetNode(dragX, xClock, 0),
          resetNode(dragY, yClock, 0),
          cond(clocksNotRunning, [set(opacity, 1), call([], onGestureComplete)])
        ])
      ],
      [renderKey]
    );

    const pinchHandler = onGestureEvent({
      scale: pinch,
      state: pinchState,
      velocity: pinchVelocity
    });

    const panHandler = onGestureEvent({
      state: panState,
      translationX: dragX,
      translationY: dragY,
      velocityY,
      velocityX
    });

    return (
      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={panRef}
        {...pinchHandler}
      >
        <Animated.View>
          <PanGestureHandler
            avgTouches={true}
            ref={panRef}
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
  (prevProps, nextProps) => prevProps.renderKey === nextProps.renderKey
);
