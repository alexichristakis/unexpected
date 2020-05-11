import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  Text,
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

const { useCode, debug, block, call, greaterThan, lessOrEq, cond } = Animated;

const mapStateToProps = (state: RootState, props: ProfileProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state, props.route.params),
  friends: selectors.friends(state, props.route.params),
});
const mapDispatchToProps = {
  fetchUsersPosts: PostActions.fetchUsersPosts,
  fetchUser: UserActions.fetchUser,
};

export type ProfileReduxProps = ConnectedProps<typeof connector>;

export interface ProfileProps {
  navigation: NativeStackNavigationProp<ParamList, "PROFILE">;
  route: RouteProp<ParamList, "PROFILE">;
}

const ProfileScreen: React.FC<ProfileProps & ProfileReduxProps> = React.memo(
  ({
    navigation,
    fetchUsersPosts,
    fetchUser,
    user,
    phoneNumber,
    friends,
    route,
  }) => {
    const [showTitle, setShowTitle] = useState(false);
    const [scrollY] = useValues([0]);

    const navBarTransitionRef = useRef<TransitioningView>(null);

    const getFriendStatusState = () => {
      if (!user || !user.friends) return "unknown";
      if (user.friends.includes(phoneNumber)) return "friends";
      else return "notFriends";
    };

    useDarkStatusBar();

    useEffect(() => {
      const { phoneNumber } = route.params;

      fetchUser(phoneNumber);

      // if friends fetch and render posts too
      if (getFriendStatusState() === "friends") fetchUsersPosts(phoneNumber);
    }, [getFriendStatusState()]);

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
      <Profile />
      // <Screen stackPresentation={"push"} style={styles.container}>
      //   <NavBar
      //     transitionRef={navBarTransitionRef}
      //     backButtonText={route.params.prevRoute}
      //     showTitle={showTitle}
      //     showBackButtonText={!showTitle}
      //     title={user.firstName}
      //     navigation={navigation}
      //     rightButton={<FriendButton showLabel={!showTitle} user={user} />}
      //   />
      //   <Grid
      //     phoneNumber={route.params.phoneNumber}
      //     onPressPost={handleOnPressPost}
      //     scrollY={scrollY}
      //     friendStatus={getFriendStatusState()}
      //     onScrollEndDrag={handleOnScrollEndDrag}
      //     headerContainerStyle={styles.headerContainer}
      //     renderHeader={renderTop}
      //   />
      //   <UserModal
      //     visible={showUserModal}
      //     phoneNumber={route.params.phoneNumber}
      //     onClose={handleUserModalClose}
      //   />
      //   <PostModal
      //     postId={
      //       route.params?.focusedPostId?.length
      //         ? route.params?.focusedPostId
      //         : focusedPostId
      //     }
      //     onClose={handlePostModalClose}
      //   />
      // </Screen>
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ProfileScreen);
