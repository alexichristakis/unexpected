import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useValues, useVector, useValue } from "react-native-redash";
import { StackNavigationProp } from "@react-navigation/stack";
import { connect, ConnectedProps } from "react-redux";

import Activity from "@components/Activity";
import { Pager, TabBar } from "@components/Home";

import Feed from "@components/Feed";
import Profile from "@components/Profile";
import Settings from "@components/Settings";
import { useDarkStatusBar } from "@hooks";
import { Colors, SCREEN_WIDTH, SB_HEIGHT } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState as RootStateType } from "@redux/types";

import { StackParamList } from "../../App";
import { FriendActions } from "@redux/modules";

const connector = connect(
  (state: RootStateType) => ({
    userId: selectors.userId(state),
  }),
  {
    fetchRequests: FriendActions.fetchUsersRequests,
    fetchFriends: FriendActions.fetchFriends,
  }
);

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeOwnProps {
  navigation: StackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeReduxProps & HomeOwnProps> = ({
  userId,
  navigation,
  fetchRequests,
  fetchFriends,
}) => {
  const offset = useVector(0, 0);
  const activeTab = useValue<0 | 1 | 2>(0);
  const activityOpen = useValue<0 | 1>(0);

  useDarkStatusBar();

  useEffect(() => {
    fetchRequests();
    fetchFriends();
  }, []);

  const handleOnPressTab = (index: 0 | 1) => activeTab.setValue(index);
  const handleOnPressSettings = () => activeTab.setValue(2);

  const pagerContainer = { transform: [{ translateY: offset.y }] };
  return (
    <View style={styles.container}>
      <Activity open={activityOpen} />
      <Animated.View style={[styles.pagerContainer, pagerContainer]}>
        <Settings offset={offset.x} {...{ navigation }} />
        <Pager tab={activeTab} {...offset}>
          <Feed {...{ navigation }} />
          <Profile
            id={userId}
            style={styles.profileContainer}
            onPressSettings={handleOnPressSettings}
          />
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
    backgroundColor: Colors.darkGray,
  },
  pagerContainer: {
    flex: 1,
  },
  profileContainer: {
    paddingTop: SB_HEIGHT,
  },
});

export default connector(Home);
