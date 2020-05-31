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
import { RootState, selectors } from "@redux";

const { onChange, cond, eq } = Animated;

export interface ActivityButtonProps {
  onPress: Animated.Node<number>;
}

const connector = connect(
  (state: RootState) => ({
    numRequests: selectors.numRequests(state),
  }),
  {}
);

const ActivityButton: React.FC<
  ActivityButtonProps & ConnectedProps<typeof connector>
> = ({ numRequests, onPress }) => {
  const state = useValue(State.UNDETERMINED);

  const tapHandler = useGestureHandler({
    state,
  });

  useCode(() => [onChange(state, cond(eq(state, State.END), onPress))], []);

  return (
    <TapGestureHandler {...tapHandler}>
      <Animated.View style={styles.container}>
        <Text style={styles.text}>{numRequests}</Text>
      </Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 35,
    height: 35,
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
