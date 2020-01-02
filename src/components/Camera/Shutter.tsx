import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

import ShutterSVG from "@assets/svg/shutter.svg";

export interface ShutterProps {
  onPress: () => void;
  dark?: boolean;
  style?: ViewStyle;
}
export const Shutter = ({ onPress, dark, style }: ShutterProps) => {
  const backgroundColor = dark ? "black" : "white";

  return (
    <TouchableOpacity
      // style={styles.container}
      onPress={onPress}
    >
      <ShutterSVG width={70} height={70} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25
  }
});
