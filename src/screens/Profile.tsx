import React, { useState } from "react";
import { Animated, Button, StyleSheet, Text, View } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

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
  user: selectors.user(state),
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
  user
}) => {
  const [scrollY] = useState(new Animated.Value(0));
  const [onScroll] = useState(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true
    })
  );

  const renderTop = () => <Top user={user} scrollY={scrollY} />;

  return (
    <Screen style={styles.container}>
      <Grid
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headerContainer: {
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
