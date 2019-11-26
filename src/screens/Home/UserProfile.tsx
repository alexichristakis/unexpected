import React, { useCallback, useState } from "react";
import { Animated, Button, StyleSheet, Text, StatusBar } from "react-native";

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
import { StackParamList } from "../../App";

const mapStateToProps = (state: RootState) => ({
  user: selectors.user(state),
  posts: selectors.currentUsersPosts(state),
  stale: selectors.currentUsersPostsStale(state)
});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  fetchUsersPosts: PostActions.fetchUsersPosts
};

export type UserProfileReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface UserProfileOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "USER_PROFILE">;
  route: RouteProp<StackParamList, "USER_PROFILE">;
}
export type UserProfileProps = UserProfileOwnProps & UserProfileReduxProps;

export const UserProfile: React.FC<UserProfileProps> = React.memo(
  ({ navigation, fetchUsersPosts, stale, posts, user }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const [onScroll] = useState(
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true
      })
    );

    useFocusEffect(
      useCallback(() => {
        StatusBar.setHidden(false);
        if (stale) fetchUsersPosts();
      }, [stale])
    );

    const goToNewProfilePicture = () => {
      navigation.navigate("NEW_PROFILE_PICTURE");
    };

    const goToSettings = () => {
      navigation.navigate("SETTINGS");
    };

    const goToFollowing = () => {
      navigation.navigate("FOLLOWING", { user });
    };

    const renderTop = () => (
      <Top
        user={user}
        scrollY={scrollY}
        onPressFollowing={goToFollowing}
        onPressImage={goToNewProfilePicture}
        onPressName={goToSettings}
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
        {/* <Header title={user.firstName} scrollY={scrollY} /> */}
      </Screen>
    );
  },
  (prevProps, nextProps) => prevProps.stale === nextProps.stale
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center"
    // justifyContent: "center"
  },
  headerContainer: {
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
