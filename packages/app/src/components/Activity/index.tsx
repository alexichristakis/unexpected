import React from "react";
import { View } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import Animated from "react-native-reanimated";
import { RootState } from "@redux/types";
import { ACTIVITY_HEIGHT } from "@lib";

const connector = connect((state: RootState) => ({}), {});

export interface ActivityProps {}

export type ActivityConnectedProps = ConnectedProps<typeof connector>;

const Activity: React.FC<ActivityProps & ActivityConnectedProps> = ({}) => {
  return (
    <Animated.ScrollView
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: ACTIVITY_HEIGHT,
      }}
    ></Animated.ScrollView>
  );
};

export default connector(Activity);
