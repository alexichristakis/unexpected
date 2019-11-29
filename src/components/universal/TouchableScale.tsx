import React, { useState } from "react";
import { BaseButton } from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";

export interface TouchableScaleProps {
  onPress?: () => void;
  children: React.ReactNode[] | React.ReactChild;
}
export const TouchableScale: React.FC<TouchableScaleProps> = ({
  children,
  onPress
}) => {
  const [scale] = useState(new Animated.Value(1));

  const update = (active: boolean) => {
    Animated.timing(scale, {
      toValue: active ? 0.95 : 1,
      duration: 150,
      easing: Easing.ease
    }).start();
  };

  if (onPress)
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <BaseButton onActiveStateChange={update} onPress={onPress}>
          {children}
        </BaseButton>
      </Animated.View>
    );
  else return <>{children}</>;
};
