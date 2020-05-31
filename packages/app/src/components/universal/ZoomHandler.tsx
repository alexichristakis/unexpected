import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import {
  vec,
  pinchActive,
  pinchBegan,
  translate,
  timing,
  useGestureHandler,
  useValues,
  useValue,
  useVectors,
  transformOrigin,
  clamp,
} from "react-native-redash";

import { POST_WIDTH, IMAGE_HEIGHT } from "@lib";

const { cond, eq, set } = Animated;

const DURATION = 150;
const EASING = Easing.ease;

const ZoomHandler: React.FC = ({ children }) => {
  const state = useValue(State.UNDETERMINED);
  const [origin, pinch, focal] = useVectors([0, 0], [0, 0], [0, 0]);
  const [pinchScale, numberOfPointers] = useValues(1, 0);

  const pinchGestureHandler = useGestureHandler({
    numberOfPointers,
    scale: pinchScale,
    state,
    focalX: focal.x,
    focalY: focal.y,
  });

  const adjustedFocal = vec.sub(focal, {
    x: POST_WIDTH / 2,
    y: IMAGE_HEIGHT / 2,
  });

  const active = pinchActive(state, numberOfPointers);
  const scale = clamp(pinchScale, 1, 2);

  useCode(
    () => [
      cond(pinchBegan(state), vec.set(origin, adjustedFocal)),
      cond(active, [
        //
        vec.set(
          pinch,
          vec.add(
            vec.sub(adjustedFocal, origin),
            origin,
            vec.multiply(-1, scale, origin)
          )
        ),
      ]),
      cond(eq(state, State.END), [
        set(
          pinch.x,
          timing({ from: pinch.x, to: 0, duration: DURATION, easing: EASING })
        ),
        set(
          pinch.y,
          timing({ from: pinch.y, to: 0, duration: DURATION, easing: EASING })
        ),
        set(
          pinchScale,
          timing({
            from: pinchScale,
            to: 1,
            duration: DURATION,
            easing: EASING,
          })
        ),
      ]),
    ],
    []
  );

  return (
    <PinchGestureHandler {...pinchGestureHandler}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [...translate(pinch), { scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
};

const ZoomHandler1: React.FC = ({ children }) => {
  const state = useValue(State.UNDETERMINED);
  const [origin, pinch, focal] = useVectors([0, 0], [0, 0], [0, 0]);
  const [pinchScale, numberOfPointers] = useValues(1, 0);

  const pinchGestureHandler = useGestureHandler({
    numberOfPointers,
    scale: pinchScale,
    state,
    focalX: focal.x,
    focalY: focal.y,
  });

  const adjustedFocal = vec.sub(focal, {
    x: POST_WIDTH / 2,
    y: IMAGE_HEIGHT / 2,
  });

  const active = pinchActive(state, numberOfPointers);
  useCode(
    () => [
      cond(pinchBegan(state), vec.set(origin, adjustedFocal)),
      cond(active, [vec.set(pinch, vec.minus(vec.sub(origin, adjustedFocal)))]),
      cond(eq(state, State.END), [
        set(
          pinch.x,
          timing({ from: pinch.x, to: 0, duration: DURATION, easing: EASING })
        ),
        set(
          pinch.y,
          timing({ from: pinch.y, to: 0, duration: DURATION, easing: EASING })
        ),
        set(
          pinchScale,
          timing({
            from: pinchScale,
            to: 1,
            duration: DURATION,
            easing: EASING,
          })
        ),
      ]),
    ],
    []
  );

  const scale = clamp(pinchScale, 1, 2);
  return (
    <PinchGestureHandler {...pinchGestureHandler}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              ...translate(pinch),
              ...transformOrigin(origin, { scale }),
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
};

export default ZoomHandler;
