import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, ViewProps } from "react-native";

import { Colors, TextStyles } from "@lib/styles";

export interface ButtonProps extends ViewProps {
  size?: "small" | "medium" | "large";
  title: string;
  onPress: () => void;
}
export const Button: React.FC<ButtonProps> = ({
  style,
  size = "medium",
  title,
  onPress
}) => {
  const [touched, onTouch] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      onPressIn={() => onTouch(true)}
      onPressOut={() => onTouch(false)}
    >
      <Text style={TextStyles[size]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderColor: Colors.nearBlack,
    borderWidth: 1
  }
});
