import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { BaseButton } from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";

export interface TouchableScaleProps {
  onPress?: () => void;
  style?: Animated.AnimateStyle<ViewStyle>;
  toScale?: number;
  children: React.ReactNode[] | React.ReactChild;
}
export const TouchableScale: React.FC<TouchableScaleProps> = ({
  children,
  style,
  toScale = 0.95,
  onPress,
}) => {
  const [scale] = useState(new Animated.Value(1));

  const update = (active: boolean) => {
    Animated.timing(scale, {
      toValue: active ? toScale : 1,
      duration: 150,
      easing: Easing.ease,
    }).start();
  };

  if (onPress)
    return (
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <BaseButton onActiveStateChange={update} onPress={onPress}>
          {children}
        </BaseButton>
      </Animated.View>
    );
  else return <>{children}</>;
};
