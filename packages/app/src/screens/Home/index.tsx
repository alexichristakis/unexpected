import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import { useVector, useValue } from "react-native-redash";
import Animated, { interpolate, Extrapolate } from "react-native-reanimated";

import { Pager, TabBar } from "@components/Home";

import { RootState as RootStateType } from "@redux/types";
import Feed from "@components/Feed";
import Profile from "@components/Profile";
import { Colors, SCREEN_WIDTH } from "@lib";

import { StackParamList } from "../../App";

const connector = connect((state: RootStateType) => ({}), {});

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeOwnProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeReduxProps & HomeOwnProps> = ({ navigation }) => {
  const offset = useVector(0, 0);
  const activeTab = useValue<0 | 1>(0);

  const borderRadius = interpolate(offset.x, {
    inputRange: [-SCREEN_WIDTH - 50, -SCREEN_WIDTH, 0],
    outputRange: [20, 1, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const handleOnPressTab = (index: 0 | 1) => activeTab.setValue(index);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.gray }}>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 200,
          backgroundColor: "red",
        }}
      ></View>
      <Animated.View style={{ flex: 1, transform: [{ translateY: offset.y }] }}>
        <Pager
          tab={activeTab}
          style={{ borderTopRightRadius: borderRadius }}
          {...offset}
        >
          <Feed />
          <Profile />
          <View style={{ width: 100 }} />
        </Pager>
        <TabBar onPress={handleOnPressTab} {...offset} />
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
