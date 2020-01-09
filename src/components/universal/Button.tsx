import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  ViewProps
} from "react-native";
import Animated from "react-native-reanimated";
import { bInterpolateColor } from "react-native-redash";

import { Colors, TextSizes, TextStyles } from "@lib/styles";

import TapHandler from "./TapHandler";

const { Value } = Animated;

export interface ButtonProps extends ViewProps {
  light?: boolean;
  size?: TextSizes;
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
  title,
  onPress
}) => {
  const [value] = useState(new Value(0));

  const containerStyle = {
    borderColor: light ? Colors.lightGray : Colors.nearBlack,
    borderWidth: light ? 5 : 1
  };

  const textColor: TextStyle = {
    color: light ? Colors.lightGray : Colors.nearBlack,
    fontWeight: light ? "600" : "normal"
  };

  return (
    <TapHandler
      disabled={disabled}
      value={value}
      onPress={onPress}
      style={[
        style,
        styles.container,
        containerStyle,
        {
          backgroundColor: bInterpolateColor(
            value,
            Colors.background,
            Colors.nearBlack
          )
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Animated.Text
          style={[
            TextStyles.small,
            {
              textTransform: "uppercase",
              color: bInterpolateColor(
                value,
                Colors.nearBlack,
                Colors.background
              )
            }
          ]}
        >
          {title}
        </Animated.Text>
      )}
    </TapHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 4,
    paddingHorizontal: 30
  }
});
