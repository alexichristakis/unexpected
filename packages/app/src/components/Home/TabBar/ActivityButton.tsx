import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle, Text } from "react-native";
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useCode,
} from "react-native-reanimated";
import { useGestureHandler, useValue } from "react-native-redash";

import { Colors, SCREEN_WIDTH, TextStyles } from "@lib";

import { connect, ConnectedProps } from "react-redux";
import { RootState } from "@redux/types";

const { onChange, cond, eq } = Animated;

export interface ActivityButtonProps {
  onPress: Animated.Node<number>;
}

const connector = connect(
  (state: RootState) => ({
    //
  }),
  {}
);

const ActivityButton: React.FC<
  ActivityButtonProps & ConnectedProps<typeof connector>
> = ({ onPress }) => {
  const state = useValue(State.UNDETERMINED);

  const tapHandler = useGestureHandler({
    state,
  });

  useCode(() => [onChange(state, cond(eq(state, State.END), onPress))], []);

  return (
    <TapGestureHandler {...tapHandler}>
      <Animated.View style={styles.container}>
        <Text style={styles.text}>5</Text>
      </Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.purple,
  },
  text: {
    ...TextStyles.medium,
    color: Colors.lightGray,
  },
});

export default connector(ActivityButton);
