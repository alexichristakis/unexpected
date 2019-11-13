import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

export interface ShutterProps {
  onPress: () => void;
  dark?: boolean;
  style?: ViewStyle;
}
export const Shutter = ({ onPress, dark, style }: ShutterProps) => {
  const backgroundColor = dark ? "black" : "white";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }, style]}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25
  }
});
