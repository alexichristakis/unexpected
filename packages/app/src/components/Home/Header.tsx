import React from "react";
import Animated, { useCode, debug } from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { SCREEN_WIDTH } from "@lib/constants";
import { mix } from "react-native-redash";
import { StyleSheet } from "react-native";
import { SB_HEIGHT, TextStyles } from "@lib/styles";

const { divide } = Animated;

export interface HeaderProps {
  offset: Animated.Value<number>;
}

export const Header: React.FC<HeaderProps> = ({ offset }) => {
  const val = divide(offset, -SCREEN_WIDTH);
  const opacity1 = mix(val, 1, 0.5);
  const opacity2 = mix(val, 0.5, 1);
  const translateX = mix(val, 0, -55);

  return (
    <Animated.View style={styles.container}>
      <Animated.View
        style={{ flexDirection: "row", transform: [{ translateX }] }}
      >
        <Animated.Text
          style={[TextStyles.title, { marginRight: 10, opacity: opacity1 }]}
        >
          feed
        </Animated.Text>
        <Animated.Text style={[TextStyles.title, { opacity: opacity2 }]}>
          profile
        </Animated.Text>
      </Animated.View>
      <Animated.View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "blue",
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    top: 0,
    left: 10,
    paddingTop: SB_HEIGHT + 10,
    width: SCREEN_WIDTH - 20,
    flexDirection: "row",
  },
});
