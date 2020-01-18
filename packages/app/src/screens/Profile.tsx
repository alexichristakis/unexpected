import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import isEqual from "lodash/isEqual";
import Animated, { TransitioningView } from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { Post } from "@unexpected/global";
import uuid from "uuid/v4";
import Haptics from "react-native-haptic-feedback";

import { Grid, Top } from "@components/Profile";
import { FriendButton, NavBar } from "@components/universal";
import { SB_HEIGHT } from "@lib/styles";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";
import { useDarkStatusBar } from "@hooks";

const { useCode, block, call, greaterThan, lessOrEq, cond } = Animated;

const mapStateToProps = (state: RootState, props: ProfileProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  postsLoading: selectors.postLoading(state),
  user: selectors.user(state, props.route.params, props.route.params.user),
  posts: selectors.usersPosts(state, props.route.params.user)
});
const mapDispatchToProps = {
  fetchUsersPosts: PostActions.fetchUsersPosts,
  fetchUser: UserActions.fetchUser
};

export type ProfileReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface ProfileProps {
  navigation: NativeStackNavigationProp<StackParamList, "PROFILE">;
  route: RouteProp<StackParamList, "PROFILE">;
}

const Profile: React.FC<ProfileProps & ProfileReduxProps> = React.memo(
  ({
    postsLoading,
    navigation,
    fetchUsersPosts,
    fetchUser,
    posts,
    user,
    phoneNumber,
    route
  }) => {
    const [showTitle, setShowTitle] = useState(false);
    const [releasedPosts, setReleasedPosts] = useState(posts);
    const [scrollY] = useState(new Animated.Value(0));

    const navBarTransitionRef = React.createRef<TransitioningView>();
    const gridTransitionRef = React.createRef<TransitioningView>();

    const getFriendStatusState = () => {
      if (!user || !user.friends) return "unknown";
      if (user.friends.includes(phoneNumber)) return "friends";
      else return "notFriends";
    };

    useDarkStatusBar();

    useEffect(() => {
      const {
        user: { phoneNumber }
      } = route.params;

      fetchUser(phoneNumber);

      // if friends fetch and render posts too
      if (getFriendStatusState() === "friends") fetchUsersPosts(phoneNumber);
    }, [getFriendStatusState()]);

    useLayoutEffect(() => {
      gridTransitionRef.current?.animateNextTransition();
      setReleasedPosts(posts);
    }, [posts.length]);

    useCode(
      () =>
        block([
          cond(
            greaterThan(scrollY, 100),
            call([], ([]) => {
              navBarTransitionRef.current?.animateNextTransition();
              setShowTitle(true);
            })
          ),
          cond(
            lessOrEq(scrollY, 100),
            call([], ([]) => {
              navBarTransitionRef.current?.animateNextTransition();
              setShowTitle(false);
            })
          )
        ]),
      [showTitle]
    );

    const goToFriends = () => {
      navigation.navigate({
        name: "FRIENDS",
        key: uuid(),
        params: { user }
      });
    };

    const renderTop = () => (
      <Top
        user={user}
        numPosts={posts.length}
        scrollY={scrollY}
        onPressFriends={goToFriends}
      />
    );

    const handleOnPressPost = (post: Post) => {
      navigation.navigate({
        name: "POST",
        key: uuid(),
        params: { prevRoute: user.firstName, post: { ...post, user } }
      });
    };

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
          user={user}
          transitionRef={gridTransitionRef}
          loading={postsLoading}
          onPressPost={handleOnPressPost}
          scrollY={scrollY}
          friendStatus={getFriendStatusState()}
          onScrollEndDrag={handleOnScrollEndDrag}
          ListHeaderComponentStyle={styles.headerContainer}
          ListHeaderComponent={renderTop}
          posts={releasedPosts}
        />
      </Screen>
    );
  },
  (prevProps, nextProps) =>
    isEqual(prevProps.user, nextProps.user) &&
    prevProps.posts.length === nextProps.posts.length &&
    prevProps.postsLoading === nextProps.postsLoading
);

const styles = StyleSheet.create({
  container: {
    paddingTop: SB_HEIGHT(),
    alignItems: "center"
  },
  headerContainer: {
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
