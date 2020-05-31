import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useCode } from "react-native-reanimated";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { useValue, useGestureHandler } from "react-native-redash";

import { Colors } from "@lib";
import Chevron from "@assets/svg/back_chevron.svg";

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
      <Animated.View style={styles.container}>
        <Chevron fill={Colors.darkGray} width={20} height={20} />
      </Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    right: 10,
    bottom: 30,
    backgroundColor: Colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-90deg" }],
  },
});

export default CloseButton;
