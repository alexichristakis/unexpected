import React, { useCallback, useState } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { PostType } from "unexpected-cloud/models/post";
import uuid from "uuid/v4";

import { Top } from "@components/Profile";
import { Grid } from "@components/Profile/Grid";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState, props: ProfileProps) => ({
  posts: selectors.usersPosts(state, props.route.params.user)
});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  fetchUsersPosts: PostActions.fetchUsersPosts
};

export type ProfileReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface ProfileProps {
  navigation: NativeStackNavigationProp<StackParamList, "PROFILE">;
  route: RouteProp<StackParamList, "PROFILE">;
}

const Profile: React.FC<ProfileProps & ProfileReduxProps> = ({
  navigation,
  fetchUsersPosts,
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

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(false);
      fetchUsersPosts(user.phoneNumber);
    }, [])
  );

  const goToFriends = () => {
    navigation.navigate("FRIENDS", { user });
  };

  const renderTop = () => (
    <Top
      numPosts={posts.length}
      user={user}
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
