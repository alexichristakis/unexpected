import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  TextStyle
} from "react-native";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  "window"
);

const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

export const isIPhoneX =
  (SCREEN_WIDTH === X_WIDTH && SCREEN_HEIGHT === X_HEIGHT) ||
  (SCREEN_WIDTH === XSMAX_WIDTH && SCREEN_HEIGHT === XSMAX_HEIGHT);

export const SB_HEIGHT = () =>
  Platform.select({
    ios: isIPhoneX ? 44 : 20,
    android: StatusBar.currentHeight,
    default: 0
  });

export const Colors = {
  nearBlack: "rgb(10, 10, 10)",
  gray: "rgb(120,120,120)",
  lightGray: "rgb(245, 245, 245)",
  red: "rgb(255, 0, 0)",
  yellow: "rgb(0, 0, 0)",
  green: "rgb(0, 255, 0)"
};

const baseText: TextStyle = {
  fontFamily: "AvenirNext-Regular"
};

export enum TextSizes {
  small = "small",
  medium = "medium",
  large = "large",
  title = "title",
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
  },
  title: {
    ...baseText,
    fontSize: 26,
    color: Colors.nearBlack
  }
});
