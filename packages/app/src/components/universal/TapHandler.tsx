import React, { ReactNode } from "react";
import { View, StyleProp, StyleSheet, ViewStyle } from "react-native";

import { BaseButton } from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";

interface TapHandlerProps {
  value: Animated.Value<number>;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  children: ReactNode;
}

export default ({
  onPress,
  children,
  value,
  disabled,
  style,
  containerStyle,
  animatedStyle
}: TapHandlerProps) => {
  const handleOnActiveStateChanged = (active: boolean) => {
    if (active) {
      Animated.timing(value, {
        duration: 250,
        toValue: 1,
        easing: Easing.inOut(Easing.ease)
      }).start();
    } else {
      Animated.timing(value, {
        duration: 250,
        toValue: 0,
        easing: Easing.inOut(Easing.ease)
      }).start();
    }
  };

  const content = (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );

  if (disabled)
    return <View style={[containerStyle, styles.container]}>{content}</View>;

  return (
    <BaseButton
      style={[containerStyle, styles.container]}
      onActiveStateChange={handleOnActiveStateChanged}
      onPress={onPress}
    >
      {content}
    </BaseButton>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch"
    // justifyContent: "center"
    // alignItems: "center"
  }
});
