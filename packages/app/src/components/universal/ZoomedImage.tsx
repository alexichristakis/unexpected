import React from "react";
import { StyleSheet, View } from "react-native";

import Animated, { Extrapolate, interpolate } from "react-native-reanimated";

import PostImage from "./PostImage";
import { ZoomHandlerGestureBeganPayload } from "./ZoomHandler";

import { Colors } from "@lib";

export type Measurement = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ZoomedImageType = {
  id: string;
  phoneNumber: string;
  width: number;
  height: number;
} & ZoomHandlerGestureBeganPayload;

export interface ZoomedImageProps extends ZoomedImageType {}
export const ZoomedImage: React.FC<ZoomedImageProps> = ({
  id,
  phoneNumber,
  width,
  height,
  measurement,
  scale,
  translateX,
  translateY,
}) => {
  const opacity = interpolate(scale, {
    inputRange: [1, 1.8],
    outputRange: [0, 0.8],
    extrapolate: Extrapolate.CLAMP,
  });

  const style = {
    left: measurement.x,
    top: measurement.y,
    transform: [{ scale }, { translateX }, { translateY }],
  };

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.root]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.background, { opacity }]}
      />
      <Animated.View style={style}>
        <PostImage
          id={id}
          phoneNumber={phoneNumber}
          width={width}
          height={height}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    zIndex: 10,
  },
  background: {
    backgroundColor: Colors.nearBlack,
  },
});
