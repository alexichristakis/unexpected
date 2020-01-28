import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Post } from "@unexpected/global";
import isEqual from "lodash/isEqual";
import Haptics from "react-native-haptic-feedback";
import Animated, { TransitioningView } from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";
import uuid from "uuid/v4";

import { Grid, Top } from "@components/Profile";
import { FriendButton, NavBar } from "@components/universal";
import { useDarkStatusBar } from "@hooks";
import { SB_HEIGHT } from "@lib/styles";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { StackParamList } from "../App";

const { useCode, block, call, greaterThan, lessOrEq, cond } = Animated;

const mapStateToProps = (state: RootState, props: ProfileProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  postsLoading: selectors.postLoading(state),
  user: selectors.user(state, props.route.params),
  posts: selectors.usersPosts(state, props.route.params)
});
const mapDispatchToProps = {
  fetchUsersPosts: PostActions.fetchUsersPosts,
  fetchUser: UserActions.fetchUser
};

export type ProfileReduxProps = ConnectedProps<typeof connector>;

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
      const { phoneNumber } = route.params;

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
        params: { prevRoute: user.firstName, postId: post.id }
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
    prevProps.posts?.length === nextProps.posts?.length &&
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Profile);
