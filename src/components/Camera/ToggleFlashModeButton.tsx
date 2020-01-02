import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { FlashMode } from "react-native-camera";

export interface ToggleFlashModeButtonProps {
  mode: keyof FlashMode;
  onPress: () => void;
}

export const ToggleFlashModeButton: React.FC<ToggleFlashModeButtonProps> = ({
  mode,
  onPress
}) => {
  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
      <Text style={{ color: "white" }}>{mode}</Text>
    </TouchableOpacity>
  );
};
