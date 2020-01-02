import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { CameraType } from "react-native-camera";

export interface FlipCameraButtonProps {
  mode: keyof CameraType;
  onPress: () => void;
}

export const FlipCameraButton: React.FC<FlipCameraButtonProps> = ({
  mode,
  onPress
}) => {
  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
      <Text style={{ color: "white", textAlign: "right" }}>{mode}</Text>
    </TouchableOpacity>
  );
};
