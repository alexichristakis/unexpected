import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

import {
  State,
  TapGestureHandler,
  BaseButton
} from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";
import { contains, delay, onGestureEvent, timing } from "react-native-redash";

interface TapHandlerProps {
  value: Animated.Value<number>;
  disabled?: boolean;
  onPress: () => void;
  style: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  children: ReactNode;
}

const {
  Value,
  Clock,
  useCode,
  block,
  cond,
  eq,
  set,
  call,
  onChange
} = Animated;
const { BEGAN, FAILED, CANCELLED, END, UNDETERMINED } = State;

export default ({
  onPress,
  children,
  value,
  disabled,
  style
}: TapHandlerProps) => {
  const clock = new Clock();
  const state = new Value(UNDETERMINED);

  const gestureHandler = onGestureEvent({ state });

  useCode(
    () =>
      block([
        cond(
          eq(state, BEGAN),
          set(
            value,
            timing({
              clock,
              from: value,
              to: 1,
              duration: 250,
              easing: Easing.inOut(Easing.ease)
            })
          )
        ),
        cond(
          eq(state, END),
          delay(
            set(
              value,
              timing({
                clock,
                from: value,
                to: 0,
                duration: 250,
                easing: Easing.inOut(Easing.ease)
              })
            ),
            250
          )
        ),
        cond(
          contains([FAILED, CANCELLED], state),
          set(
            value,
            timing({
              clock,
              from: value,
              to: 0,
              duration: 250,
              easing: Easing.inOut(Easing.ease)
            })
          )
        ),
        onChange(state, cond(eq(state, END), call([], onPress)))
      ]),
    []
  );

  const content = <Animated.View style={style}>{children}</Animated.View>;

  if (disabled) return content;

  // return <TapGestureHandler {...gestureHandler}>{content}</TapGestureHandler>;

  return (
    <BaseButton onActiveStateChange={} onPress={onPress}>
      {content}
    </BaseButton>
  );
};
