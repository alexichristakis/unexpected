import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewProps,
  TextStyle
} from "react-native";

import { Colors, TextStyles } from "@lib/styles";

export interface ButtonProps extends ViewProps {
  light?: boolean;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  title: string;
  onPress: () => void;
}
export const Button: React.FC<ButtonProps> = ({
  style,
  light,
  disabled,
  loading,
  size = "medium",
  title,
  onPress
}) => {
  const [touched, onTouch] = useState(false);

  const containerStyle = {
    borderColor: light ? Colors.lightGray : Colors.nearBlack,
    borderWidth: light ? 5 : 1
  };

  const textColor: TextStyle = {
    color: light ? Colors.lightGray : Colors.nearBlack,
    fontWeight: light ? "600" : "normal"
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.container, style, containerStyle]}
      onPress={onPress}
      onPressIn={() => onTouch(true)}
      onPressOut={() => onTouch(false)}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={[TextStyles[size], textColor]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30
  }
});
