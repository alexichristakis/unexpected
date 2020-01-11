import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";

import Animated from "react-native-reanimated";

import {
  PostImage,
  ZoomHandlerGestureBeganPayload
} from "@components/universal";
import { SCREEN_WIDTH, Colors } from "@lib/styles";

export type Measurement = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FocusedImageType = {
  id: string;
  phoneNumber: string;
} & ZoomHandlerGestureBeganPayload;

export interface FocusedImageProps extends FocusedImageType {}

export const FocusedImage: React.FC<FocusedImageProps> = ({
  id,
  phoneNumber,
  measurement,
  scale,
  translateX,
  translateY
}) => {
  const opacity = scale.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.5, 0, 0.5]
  });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.root]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.background, { opacity }]}
      />
      <Animated.View
        style={{
          left: measurement.x,
          top: measurement.y,
          transform: [{ scale }, { translateX }, { translateY }]
        }}
      >
        <PostImage
          id={id}
          phoneNumber={phoneNumber}
          width={SCREEN_WIDTH - 40}
          height={1.2 * (SCREEN_WIDTH - 40)}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    zIndex: 10
  },
  background: {
    backgroundColor: Colors.gray
  }
});
