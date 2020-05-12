import React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import { useVector, useValues } from "react-native-redash";
import Animated from "react-native-reanimated";

import Activity from "@components/Activity";
import { Pager, TabBar } from "@components/Home";

import * as selectors from "@redux/selectors";
import { RootState as RootStateType } from "@redux/types";
import Feed from "@components/Feed";
import Profile from "@components/Profile";
import { Colors, SCREEN_WIDTH } from "@lib";
import { useDarkStatusBar } from "@hooks";

import { StackParamList } from "../../App";

const connector = connect(
  (state: RootStateType) => ({
    userId: selectors.userId(state),
  }),
  {}
);

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeOwnProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeReduxProps & HomeOwnProps> = ({
  userId,
  navigation,
}) => {
  const offset = useVector(0, 0);
  const [activeTab, activityOpen] = useValues<0 | 1>([0, 0]);

  useDarkStatusBar();

  const handleOnPressTab = (index: 0 | 1) => activeTab.setValue(index);

  const pagerContainer = { flex: 1, transform: [{ translateY: offset.y }] };
  return (
    <View style={styles.container}>
      <Activity />
      <Animated.View style={pagerContainer}>
        <Pager tab={activeTab} {...offset}>
          <Feed />
          <Profile {...{ userId }} />
          <View style={{ width: 100 }} />
        </Pager>
        <TabBar
          open={activityOpen}
          onPress={handleOnPressTab}
          {...offset}
          {...{ navigation }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
  },
});

export default connector(Home);
