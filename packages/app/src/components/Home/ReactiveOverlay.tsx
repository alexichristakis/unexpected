import React, { useEffect, useState } from "react";
import Animated, {
  useCode,
  interpolate,
  onChange,
  call,
} from "react-native-reanimated";
import { StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@lib";

export interface ReactiveOverlayProps {
  onPress: () => void;
  style?: Animated.AnimateStyle<ViewStyle>;
  value: Animated.Adaptable<number>;
  active: Animated.Adaptable<0 | 1>;
  inputRange: [number, number];
}

export const ReactiveOverlay: React.FC<ReactiveOverlayProps> = ({
  onPress,
  value,
  style: _style,
  active,
  inputRange,
}) => {
  const [isActive, setIsActive] = useState(false);

  useCode(
    () => [
      onChange(
        active,
        call([active], ([active]) => setIsActive(!!active))
      ),
    ],
    []
  );

  const style = {
    opacity: interpolate(value, {
      inputRange,
      outputRange: [0.5, 0],
    }),
    backgroundColor: Colors.transGray,
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style, _style]}
      onTouchEnd={onPress}
      pointerEvents={isActive ? "auto" : "none"}
    />
  );
};
