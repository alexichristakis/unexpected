import React from "react";
import { TouchableOpacity } from "react-native";
import { FlashMode } from "react-native-camera";

import FlashOnSVG from "@assets/svg/flash_on.svg";
import FlashOffSVG from "@assets/svg/flash_off.svg";
import FlashAutoSVG from "@assets/svg/flash_auto.svg";

export interface ToggleFlashModeButtonProps {
  mode: keyof FlashMode;
  onPress: () => void;
}

export const ToggleFlashModeButton: React.FC<ToggleFlashModeButtonProps> = ({
  mode,
  onPress
}) => {
  const renderIcon = () => {
    const iconProps = { width: 50, height: 50 };
    switch (mode) {
      case "on":
        return <FlashOnSVG {...iconProps} />;

      case "off":
        return <FlashOffSVG {...iconProps} />;

      case "auto":
        return <FlashAutoSVG {...iconProps} />;

      default:
        return <FlashAutoSVG {...iconProps} />;
    }
  };

  return <TouchableOpacity onPress={onPress}>{renderIcon()}</TouchableOpacity>;
};
