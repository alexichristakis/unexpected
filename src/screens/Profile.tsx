import React, {
  useCallback,
  useState,
  useEffect,
  useLayoutEffect
} from "react";
import { StatusBar, StyleSheet } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import isEqual from "lodash/isEqual";
import Animated, { TransitioningView } from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { PostType } from "unexpected-cloud/models/post";
import uuid from "uuid/v4";

import { Grid, Top } from "@components/Profile";
import { FriendButton, NavBar } from "@components/universal";
import { SB_HEIGHT } from "@lib/styles";
import { formatName } from "@lib/utils";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";

const { useCode, block, call, greaterThan, lessOrEq, cond } = Animated;

/* need to change to watch user from redux state and use phone number from route for fetching purposes only */

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

    useFocusEffect(
      useCallback(() => {
        StatusBar.setHidden(false);

        return () => {};
      }, [route.params.user.phoneNumber])
    );

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
      navigation.navigate({ name: "FRIENDS", key: uuid(), params: { user } });
    };

    const renderTop = () => (
      <Top
        user={user}
        numPosts={posts.length}
        scrollY={scrollY}
        onPressFriends={goToFriends}
      />
    );

    const handleOnPressPost = (post: PostType) => {
      navigation.navigate({
        name: "POST",
        key: uuid(),
        params: { post: { ...post, user } }
      });
    };

    return (
      <Screen style={styles.container}>
        <NavBar
          transitionRef={navBarTransitionRef}
          // TODO: get backbutton text from route params
          backButtonText={"search"}
          showTitle={showTitle}
          title={user.firstName}
          navigation={navigation}
          rightButton={<FriendButton showLabel={!showTitle} user={user} />}
        />
        <Grid
          transitionRef={gridTransitionRef}
          loading={postsLoading}
          user={user}
          onPressPost={handleOnPressPost}
          scrollY={scrollY}
          friendStatus={getFriendStatusState()}
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
