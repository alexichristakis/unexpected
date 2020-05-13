import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import isEqual from "lodash/isEqual";
import Haptics from "react-native-haptic-feedback";
import Animated, { TransitioningView } from "react-native-reanimated";
import { useValues } from "react-native-redash";
import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import Profile from "@components/Profile";
import { FriendButton, ModalListRef, NavBar } from "@components/universal";
import { useDarkStatusBar } from "@hooks";
import { SB_HEIGHT } from "@lib";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { ParamList } from "../App";
import { FriendActions } from "@redux/modules";

const { useCode, debug, block, call, greaterThan, lessOrEq, cond } = Animated;

const connector = connect((state: RootState, props: ProfileProps) => ({}), {
  fetchUsersPosts: PostActions.fetchUsersPosts,
  fetchUsersFriends: FriendActions.fetchFriends,
});

export type ProfileReduxProps = ConnectedProps<typeof connector>;

export interface ProfileProps {
  navigation: NativeStackNavigationProp<ParamList, "PROFILE">;
  route: RouteProp<ParamList, "PROFILE">;
}

const ProfileScreen: React.FC<ProfileProps & ProfileReduxProps> = React.memo(
  ({
    navigation,
    fetchUsersPosts,
    fetchUsersFriends,
    // user,
    // phoneNumber,
    // friends,
    route,
  }) => {
    const [showTitle, setShowTitle] = useState(false);
    const [scrollY] = useValues([0]);

    const navBarTransitionRef = useRef<TransitioningView>(null);

    useDarkStatusBar();

    const { id } = route.params;
    useEffect(() => {
      fetchUsersFriends(id);
      fetchUsersPosts(id);
    }, [id]);

    useCode(
      () =>
        block([
          cond(
            greaterThan(scrollY, 60),
            call([], ([]) => {
              navBarTransitionRef.current?.animateNextTransition();
              setShowTitle(true);
            })
          ),
          cond(
            lessOrEq(scrollY, 60),
            call([], ([]) => {
              navBarTransitionRef.current?.animateNextTransition();
              setShowTitle(false);
            })
          ),
        ]),
      []
    );

    return (
      <View style={{ flex: 1, paddingTop: SB_HEIGHT }}>
        <NavBar
          transitionRef={navBarTransitionRef}
          // backButtonText={route.params.prevRoute}
          showTitle={showTitle}
          showBackButtonText={!showTitle}
          // title={user.firstName}
          navigation={navigation}
          // rightButton={<FriendButton showLabel={!showTitle} user={user} />}
        />
        <Profile {...{ id }} />
      </View>
      //   <NavBar
      //     transitionRef={navBarTransitionRef}
      //     backButtonText={route.params.prevRoute}
      //     showTitle={showTitle}
      //     showBackButtonText={!showTitle}
      //     title={user.firstName}
      //     navigation={navigation}
      //     rightButton={<FriendButton showLabel={!showTitle} user={user} />}
      //   />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT,
    alignItems: "center",
  },
  headerContainer: {
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch",
  },
});

export default connector(ProfileScreen);
