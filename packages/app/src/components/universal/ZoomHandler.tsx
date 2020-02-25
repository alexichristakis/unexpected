import React from "react";
import { findNodeHandle, UIManager } from "react-native";

import {
  PanGestureHandler,
  PinchGestureHandler,
  State
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
  clamp,
  contains,
  onGestureEvent,
  useValues,
  withSpring
} from "react-native-redash";

import { Measurement } from "@components/universal";

const { max, useCode, divide, block, cond, call } = Animated;
const { BEGAN, UNDETERMINED } = State;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

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

    const [pinchState, panState] = useValues<State>(
      [UNDETERMINED, UNDETERMINED],
      []
    );

    const [
      dragX,
      dragY,
      velocityY,
      velocityX,
      pinch,
      pinchVelocity,
      opacity
    ] = useValues<number>([0, 0, 0, 0, 1, 0, 1], []);

    const handleOnSnap = () => {
      opacity.setValue(1);
      onGestureComplete();
    };

    const scale = max(
      clamp(
        withSpring({
          value: pinch,
          velocity: pinchVelocity,
          state: pinchState,
          snapPoints: [1],
          onSnap: handleOnSnap,
          config
        }),
        0,
        pinch
      ),
      1
    );

    const [translateY, translateX] = [
      divide(
        withSpring({
          value: dragY,
          velocity: velocityY,
          state: panState,
          snapPoints: [0],
          onSnap: handleOnSnap,
          config
        }),
        scale
      ),
      divide(
        withSpring({
          value: dragX,
          velocity: velocityX,
          state: panState,
          snapPoints: [0],
          onSnap: handleOnSnap,
          config
        }),
        scale
      )
    ];

    useCode(
      () =>
        block([
          cond(
            contains([pinchState, panState], BEGAN),
            call([], () => {
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
            })
          )
        ]),
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
