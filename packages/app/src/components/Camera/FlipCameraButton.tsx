import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { CameraType } from "react-native-camera";

import FlipCameraSVG from "@assets/svg/flip_camera.svg";

export interface FlipCameraButtonProps {
  mode: keyof CameraType;
  onPress: () => void;
}

export const FlipCameraButton: React.FC<FlipCameraButtonProps> = ({
  mode,
  onPress
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <FlipCameraSVG width={50} height={50} />
    </TouchableOpacity>
  );
};
