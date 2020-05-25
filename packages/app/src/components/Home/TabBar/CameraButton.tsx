import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
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
import {
  clamp,
  mix,
  useGestureHandler,
  useValues,
  Vector,
  useValue,
} from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";

import FeedIcon from "@assets/svg/feed.svg";
import ProfileIcon from "@assets/svg/profile.svg";
import { RootState } from "@redux/types";
import {
  ACTIVITY_HEIGHT,
  Colors,
  SCREEN_WIDTH,
  withSpringImperative,
} from "@lib";
import CameraIcon from "@assets/svg/camera_button.svg";

const { set, divide, call, onChange, cond, eq } = Animated;

export interface CameraButtonProps {
  onPress: () => void;
}

const connector = connect(
  (state: RootState) => ({
    //
  }),
  {}
);

const CameraButton: React.FC<
  CameraButtonProps & ConnectedProps<typeof connector>
> = ({ onPress }) => {
  const state = useValue(State.UNDETERMINED);

  const tapHandler = useGestureHandler({
    state,
  });

  useCode(
    () => [onChange(state, cond(eq(state, State.END), call([], onPress)))],
    []
  );

  return (
    <TapGestureHandler {...tapHandler}>
      <Animated.View>
        <CameraIcon width={40} height={40} fill={Colors.gray} />
      </Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    justifyContent: "space-between",
    paddingTop: 12,
    paddingHorizontal: 20,
    height: 80,
    flexDirection: "row",
    backgroundColor: Colors.background,
  },
  indicator: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.nearBlack,
    left: 15,
    top: 28,
  },
});

export default connector(CameraButton);
