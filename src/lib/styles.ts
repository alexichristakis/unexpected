import { Dimensions, StyleSheet, Text, TextStyle } from "react-native";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  "window"
);

export const Colors = {
  nearBlack: "rgb(10, 10, 10)",
  lightGray: "rgb(245, 245, 245)",
  red: "rgb(255, 0, 0)",
  yellow: "rgb(0, 0, 0)",
  green: "rgb(0, 255, 0)"
};

const baseText: TextStyle = {
  // fontFamily:
};

export enum TextSizes {
  small = "small",
  medium = "medium",
  large = "large",
  light = "light"
}

export const TextStyles: { [key in TextSizes]: TextStyle } = StyleSheet.create({
  light: {
    color: Colors.lightGray
  },
  small: {
    ...baseText,
    fontSize: 12,
    color: Colors.nearBlack
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
