import React, { useState } from "react";
import { Animated, Button, StyleSheet, Text, View } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { PostType } from "unexpected-cloud/models/post";
import uuid from "uuid/v4";

import { Posts } from "@components/Feed";
import { Top } from "@components/Profile";
import { Grid } from "@components/Profile/Grid";
import { Header, UserImage } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  posts: selectors.usersPosts(state),
  stale: selectors.usersPostsStale(state)
});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  fetchUsersPosts: PostActions.fetchUsersPosts
};

export type ProfileReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface ProfileOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "PROFILE">;
  route: RouteProp<StackParamList, "PROFILE">;
}
export type ProfileProps = ProfileOwnProps & ProfileReduxProps;

const Profile: React.FC<ProfileProps & ProfileReduxProps> = ({
  navigation,
  fetchUsersPosts,
  stale,
  posts,
  route
}) => {
  const [scrollY] = useState(new Animated.Value(0));
  const [onScroll] = useState(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true
    })
  );

  const { user } = route.params;

  const renderTop = () => <Top user={user} scrollY={scrollY} />;

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
        onPressPost={handleOnPressPost}
        onScroll={onScroll}
        ListHeaderComponentStyle={styles.headerContainer}
        ListHeaderComponent={renderTop}
        posts={posts}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center"
  },
  headerContainer: {
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
