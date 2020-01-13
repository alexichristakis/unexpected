import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, ViewProps } from "react-native";
import Animated from "react-native-reanimated";
import { bInterpolateColor } from "react-native-redash";

import { Colors, TextStyles } from "@lib/styles";

import TapHandler from "./TapHandler";

const { Value } = Animated;

export interface ButtonProps extends ViewProps {
  icon?: SVGElement;
  disabled?: boolean;
  loading?: boolean;
  title: string;
  onPress: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  style,
  icon,
  disabled,
  loading,
  title,
  onPress
}) => {
  const [value] = useState(new Value(0));

  return (
    <TapHandler
      disabled={disabled}
      value={value}
      onPress={onPress}
      style={[
        style,
        styles.container,
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
        <>
          {icon}
          <Animated.Text
            style={[
              TextStyles.small,
              {
                marginLeft: icon ? 5 : 0,
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
        </>
      )}
    </TapHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    borderColor: Colors.nearBlack,
    borderWidth: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 4,
    paddingHorizontal: 10
  }
});
