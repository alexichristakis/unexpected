import { ACTIVITY_HEIGHT } from "@lib";
import { RootState } from "@redux/types";
import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

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
    />
  );
};

export default connector(Activity);
