import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useCode } from "react-native-reanimated";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import {
  pinchActive,
  pinchBegan,
  translate,
  vec,
  timing,
  useGestureHandler,
  useValues,
  useValue,
  useVectors,
} from "react-native-redash";

import { SCREEN_WIDTH, SCREEN_HEIGHT } from "@lib";

const { cond, eq, set } = Animated;

const CANVAS = vec.create(SCREEN_WIDTH, SCREEN_HEIGHT);
const CENTER = vec.divide(CANVAS, 2);

const ZoomHandler: React.FC = ({ children }) => {
  const state = useValue(State.UNDETERMINED);
  const [origin, pinch, focal] = useVectors([0, 0], [0, 0], [0, 0]);
  const [scale, numberOfPointers] = useValues(1, 0);

  const pinchGestureHandler = useGestureHandler({
    numberOfPointers,
    scale,
    state,
    focalX: focal.x,
    focalY: focal.y,
  });

  const adjustedFocal = vec.sub(focal, CENTER);

  const active = pinchActive(state, numberOfPointers);
  useCode(
    () => [
      cond(pinchBegan(state), vec.set(origin, adjustedFocal)),
      cond(active, [vec.set(pinch, vec.minus(vec.sub(origin, adjustedFocal)))]),
      cond(eq(state, State.END), [
        set(pinch.x, timing({ from: pinch.x, to: 0 })),
        set(pinch.y, timing({ from: pinch.y, to: 0 })),
        set(scale, timing({ from: scale, to: 1 })),
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

export default ZoomHandler;
