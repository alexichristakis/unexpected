import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

export interface ShutterProps {
  onPress: () => void;
  style?: ViewStyle;
}
const Shutter = ({ onPress, style }: ShutterProps) => {
  return <TouchableOpacity style={[styles.container, style]} onPress={onPress} />;
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white"
  }
});

export default Shutter;
