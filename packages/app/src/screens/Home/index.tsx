import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  eq,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useVector, useValue } from "react-native-redash";
import { StackNavigationProp } from "@react-navigation/stack";
import { connect, ConnectedProps } from "react-redux";

import Activity from "@components/Activity";
import { ReactiveOverlay, Pager } from "@components/Home";

import Feed from "@components/Feed";
import Profile from "@components/Profile";
import Settings from "@components/Settings";
import { useDarkStatusBar } from "@hooks";
import { Colors, SB_HEIGHT, ACTIVITY_HEIGHT } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState as RootStateType } from "@redux/types";
import { FriendActions } from "@redux/modules";

import { StackParamList } from "../../App";

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

  const closeActivity = () => activityOpen.setValue(0);
  const handleOnPressSettings = () => activeTab.setValue(2);

  const pagerContainer: Animated.AnimateStyle<ViewStyle> = {
    transform: [{ translateY: offset.y }],
    borderRadius: interpolate(offset.y, {
      inputRange: [-50, 0],
      outputRange: [20, 1],
      extrapolate: Extrapolate.CLAMP,
    }),
  };

  return (
    <View style={styles.container}>
      <Activity open={activityOpen} />
      <Animated.View style={[styles.pagerContainer, pagerContainer]}>
        <Settings offset={offset.x} {...{ navigation }} />
        <Pager
          navigation={navigation}
          open={activityOpen}
          tab={activeTab}
          offset={offset}
        >
          <Feed {...{ navigation }} />
          <Profile
            id={userId}
            style={styles.profileContainer}
            onPressSettings={handleOnPressSettings}
          />
        </Pager>
        <ReactiveOverlay
          onPress={closeActivity}
          value={offset.y}
          inputRange={[-ACTIVITY_HEIGHT, 0]}
          active={activityOpen}
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
    overflow: "hidden",
  },
  profileContainer: {
    paddingTop: SB_HEIGHT,
  },
});

export default connector(Home);
