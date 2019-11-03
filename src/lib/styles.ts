import { TextStyle, StyleSheet, Text } from "react-native";

export const Colors = {
  nearBlack: "rgb(10, 10, 10)",
  lightGray: "rgb(123, 123, 123)"
};

const baseText: TextStyle = {
  // fontFamily:
};

export const TextStyles: { [key: string]: TextStyle } = StyleSheet.create({
  small: {
    ...baseText,
    fontSize: 12,
    color: Colors.nearBlack,
    light: {}
  },
  medium: {
    ...baseText,
    fontSize: 16,
    color: Colors.nearBlack
  },
  large: {
    ...baseText,
    fontSize: 20,
    color: Colors.nearBlack
  }
});
