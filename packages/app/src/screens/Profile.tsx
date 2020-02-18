import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Post, User } from "@unexpected/global";
import isEqual from "lodash/isEqual";
import Haptics from "react-native-haptic-feedback";
import Animated, { TransitioningView } from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";
import uuid from "uuid/v4";
import { useValues } from "react-native-redash";

import { Grid, Top, UserModal, PostModal } from "@components/Profile";
import { FriendButton, NavBar, ModalListRef } from "@components/universal";
import { useDarkStatusBar } from "@hooks";
import { SB_HEIGHT } from "@lib/styles";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { ParamList } from "../App";

const { useCode, debug, block, call, greaterThan, lessOrEq, cond } = Animated;

const mapStateToProps = (state: RootState, props: ProfileProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state, props.route.params),
  friends: selectors.friends(state, props.route.params)
});
const mapDispatchToProps = {
  fetchUsersPosts: PostActions.fetchUsersPosts,
  fetchUser: UserActions.fetchUser
};

export type ProfileReduxProps = ConnectedProps<typeof connector>;

export interface ProfileProps {
  navigation: NativeStackNavigationProp<ParamList, "PROFILE">;
  route: RouteProp<ParamList, "PROFILE">;
}

const Profile: React.FC<ProfileProps & ProfileReduxProps> = React.memo(
  ({
    navigation,
    fetchUsersPosts,
    fetchUser,
    user,
    phoneNumber,
    friends,
    route
  }) => {
    const [focusedPostId, setFocusedPostId] = useState("");
    const [showUserModal, setShowUserModal] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [scrollY] = useValues([0], []);

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
          )
        ]),
      []
    );

    const renderTop = () => (
      <Top
        phoneNumber={route.params.phoneNumber}
        scrollY={scrollY}
        onPressFriends={handleOnPressFriends}
      />
    );

    const handleOnPressUser = (toUser: User) => {
      if (phoneNumber === toUser.phoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: {
            prevRoute: user.firstName,
            phoneNumber: toUser.phoneNumber
          }
        });
      }
    };

    const handleOnPressPost = ({ id }: Post) => {
      requestAnimationFrame(() => setFocusedPostId(id));
    };

    const handleOnPressFriends = () => {
      requestAnimationFrame(() => setShowUserModal(true));
    };

    const handlePostModalClose = () => setFocusedPostId("");
    const handleUserModalClose = () => setShowUserModal(false);

    const handleOnScrollEndDrag = (
      event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
      const {
        nativeEvent: {
          contentOffset: { y }
        }
      } = event;

      if (y < -100) {
        Haptics.trigger("impactMedium");
        fetchUser(phoneNumber);

        // if friends fetch and render posts too
        if (getFriendStatusState() === "friends") fetchUsersPosts(phoneNumber);
      }
    };

    return (
      <Screen style={styles.container}>
        <NavBar
          transitionRef={navBarTransitionRef}
          backButtonText={route.params.prevRoute}
          showTitle={showTitle}
          showBackButtonText={!showTitle}
          title={user.firstName}
          navigation={navigation}
          rightButton={<FriendButton showLabel={!showTitle} user={user} />}
        />
        <Grid
          phoneNumber={route.params.phoneNumber}
          onPressPost={handleOnPressPost}
          scrollY={scrollY}
          friendStatus={getFriendStatusState()}
          onScrollEndDrag={handleOnScrollEndDrag}
          headerContainerStyle={styles.headerContainer}
          renderHeader={renderTop}
        />
        <UserModal
          visible={showUserModal}
          phoneNumber={route.params.phoneNumber}
          onClose={handleUserModalClose}
        />
        <PostModal
          postId={
            route.params?.focusedPostId?.length
              ? route.params?.focusedPostId
              : focusedPostId
          }
          onClose={handlePostModalClose}
        />
      </Screen>
    );
  },
  (prevProps, nextProps) =>
    prevProps.route.params?.focusedPostId ===
      nextProps.route.params?.focusedPostId &&
    isEqual(prevProps.user, nextProps.user)
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT,
    alignItems: "center"
  },
  headerContainer: {
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Profile);
