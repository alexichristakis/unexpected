import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import { useVector } from "react-native-redash";
import Animated from "react-native-reanimated";

import { Pager, TabBar } from "@components/Home";

import { RootState as RootStateType } from "@redux/types";
import Feed from "@components/Feed";
import Profile from "@components/Profile";
import { Colors } from "@lib";

import { StackParamList } from "../../App";

const connector = connect((state: RootStateType) => ({}), {});

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeOwnProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeReduxProps & HomeOwnProps> = ({ navigation }) => {
  const offset = useVector(0, 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray }}>
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateY: offset.y }],
        }}
      >
        <Pager {...offset}>
          <Feed />
          <Profile />
        </Pager>
        <TabBar {...offset} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default connector(Home);
