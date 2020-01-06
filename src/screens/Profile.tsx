import React, { useCallback, useState } from "react";
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
import posts from "@components/Profile/Grid/test_data";
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
    const [scrollY] = useState(new Animated.Value(0));
    const ref = React.createRef<TransitioningView>();

    useCode(
      () =>
        block([
          cond(
            greaterThan(scrollY, 100),
            call([], ([]) => {
              ref.current?.animateNextTransition();
              setShowTitle(true);
            })
          ),
          cond(
            lessOrEq(scrollY, 100),
            call([], ([]) => {
              ref.current?.animateNextTransition();
              setShowTitle(false);
            })
          )
        ]),
      [showTitle]
    );

    const checkIsFriend = () => {
      if (!user || !user.friends) return "unknown";
      if (user.friends.includes(phoneNumber)) return "friends";
      else return "notFriends";
    };

    useFocusEffect(
      useCallback(() => {
        StatusBar.setHidden(false);

        const {
          user: { phoneNumber }
        } = route.params;

        fetchUser(phoneNumber);

        // if friends fetch and render posts too
        if (checkIsFriend() === "friends") fetchUsersPosts(phoneNumber);

        return () => {};
      }, [route.params.user.phoneNumber, !!user])
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
          transitionRef={ref}
          backButtonText={"search"}
          showTitle={showTitle}
          title={formatName(user)}
          navigation={navigation}
          rightButton={
            <FriendButton circle={true} showLabel={!showTitle} user={user} />
          }
        />
        <Grid
          loading={postsLoading}
          user={user}
          onPressPost={handleOnPressPost}
          scrollY={scrollY}
          friendStatus={checkIsFriend()}
          ListHeaderComponentStyle={styles.headerContainer}
          ListHeaderComponent={renderTop}
          posts={posts}
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
