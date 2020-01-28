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
  white?: boolean;
  title: string;
  onPress: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  style,
  icon,
  disabled,
  loading,
  title,
  white,
  onPress
}) => {
  const [value] = useState(new Value(0));

  return (
    <TapHandler
      disabled={disabled || loading}
      value={value}
      onPress={onPress}
      style={styles.container}
      containerStyle={style}
      animatedStyle={{
        backgroundColor: bInterpolateColor(
          value,
          white ? "white" : Colors.background,
          Colors.nearBlack
        )
      }}
    >
      <>
        {icon}
        <Animated.Text
          style={[
            TextStyles.small,
            {
              marginLeft: icon ? 5 : 0,
              textTransform: "uppercase",
              opacity: loading ? 0 : 1,
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
        {loading && <ActivityIndicator style={styles.activityIndicator} />}
      </>
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
  },
  activityIndicator: {
    position: "absolute"
  }
});
