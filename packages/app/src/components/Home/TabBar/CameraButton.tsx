import React from "react";
import { StyleSheet } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Animated, { useCode } from "react-native-reanimated";
import { useGestureHandler, useValue } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";
import { Colors, SCREEN_WIDTH } from "@lib";
import CameraIcon from "@assets/svg/camera_button.svg";

const { call, onChange, cond, eq } = Animated;

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
