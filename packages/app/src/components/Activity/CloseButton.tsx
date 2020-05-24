import { ACTIVITY_HEIGHT, Colors } from "@lib";
import { RootState } from "@redux/types";
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useCode } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { useValue, useGestureHandler } from "react-native-redash";

const { onChange, eq, cond, set } = Animated;

export interface CloseButtonProps {
  open: Animated.Value<0 | 1>;
}

const CloseButton: React.FC<CloseButtonProps> = ({ open }) => {
  const state = useValue<State>(0);

  const handler = useGestureHandler({ state });

  useCode(
    () => [onChange(state, cond(eq(state, State.END), set(open, 0)))],
    []
  );

  return (
    <TapGestureHandler {...handler}>
      <Animated.View style={styles.container}></Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    right: 10,
    bottom: 30,
    backgroundColor: Colors.lightGray,
  },
});

export default CloseButton;
