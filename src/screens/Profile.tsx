import React, { useCallback, useState } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";

import isEqual from "lodash/isEqual";
import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { PostType } from "unexpected-cloud/models/post";
import uuid from "uuid/v4";

import { Top } from "@components/Profile";
import { Grid } from "@components/Profile/Grid";
import { SB_HEIGHT } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";
import posts from "@components/Profile/Grid/test_data";

/* need to change to watch user from redux state and use phone number from route for fetching purposes only */

const mapStateToProps = (state: RootState, props: ProfileProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  postsLoading: selectors.postLoading(state),
  user: selectors.user(state, props.route.params, props.route.params.user),
  posts: selectors.usersPosts(state, props.route.params.user)
});
const mapDispatchToProps = {
  logout: AuthActions.logout,
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
    navigation,
    fetchUsersPosts,
    fetchUser,
    posts,
    user,
    phoneNumber,
    route
  }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const [onScroll] = useState(
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true
      })
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
      }, [route.params.user.phoneNumber, user])
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
        <Grid
          user={user}
          onPressPost={handleOnPressPost}
          onScroll={onScroll}
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
