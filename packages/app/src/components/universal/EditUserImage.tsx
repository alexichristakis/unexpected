import React, { useState } from "react";
import Animated, { interpolate, Easing } from "react-native-reanimated";
import { ConnectedProps, connect } from "react-redux";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  LayoutChangeEvent,
  ViewStyle,
} from "react-native";
import { RNCamera } from "react-native-camera";
import { useCamera } from "react-native-camera-hooks";
import {
  useTransition,
  bin,
  useValues,
  mix,
  transformOrigin,
} from "react-native-redash";

import { RootState, selectors, ImageActions } from "@redux";
import UserImage from "./UserImage";
import Camera from "@components/Camera";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib";

const { neq, multiply, sub, add, cond } = Animated;

const CAMERA_SIZE = SCREEN_WIDTH - 40;

const connector = connect((state: RootState) => ({}), {});

export interface EditUserImageProps {
  id: string;
  size: number;
}

export type EditUserImageConnectedProps = ConnectedProps<typeof connector>;

const EditUserImage: React.FC<
  EditUserImageProps & EditUserImageConnectedProps
> = ({ size, id }) => {
  const [top, left] = useValues<number>(0, 0);
  const [editing, setEditing] = useState(false);

  const transition = useTransition(editing, {
    duration: 400,
    easing: Easing.ease,
  });

  const handleOnLayout = (e: LayoutChangeEvent) => {
    const {
      layout: { x, y },
    } = e.nativeEvent;
    top.setValue(y);
    left.setValue(x);
  };

  const cameraStyle: Animated.AnimateStyle<ViewStyle> = {
    position: "absolute",
    alignSelf: "center",
    transform: [
      {
        translateX: mix(transition, add(-SCREEN_WIDTH / 2, left, size / 2), 0),
      },
      {
        translateY: mix(transition, top, SCREEN_HEIGHT / 2 - CAMERA_SIZE),
      },
      {
        scale: mix(transition, size / CAMERA_SIZE, 1),
      },
      {
        translateY: mix(transition, -2 * size + 20, 0),
      },
    ],
  };

  return (
    <>
      <TouchableOpacity
        onLayout={handleOnLayout}
        onPress={() => setEditing((prev) => !prev)}
      >
        <UserImage {...{ size, id }} />
      </TouchableOpacity>
      <Animated.View pointerEvents={"none"} style={cameraStyle}>
        <Camera round direction={"front"} size={CAMERA_SIZE} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default connector(EditUserImage);
