import React, { useCallback, useState } from "react";
import { Animated, StyleSheet, StatusBar } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { PostType } from "unexpected-cloud/models/post";
import _ from "lodash";
import uuid from "uuid/v4";

import { Top } from "@components/Profile";
import { Grid } from "@components/Profile/Grid";
import { Actions as UserActions } from "@redux/modules/user";
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
  fetchUser: UserActions.fetchUser,
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
  ({ navigation, fetchUser, fetchUsersPosts, stale, posts, user }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const [onScroll] = useState(
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true
      })
    );

    useFocusEffect(
      useCallback(() => {
        StatusBar.setHidden(false);
        fetchUser();
        if (stale) fetchUsersPosts();
      }, [stale])
    );

    const goToNewProfilePicture = () => {
      navigation.navigate("NEW_PROFILE_PICTURE");
    };

    const goToSettings = () => {
      navigation.navigate("SETTINGS");
    };

    const goToFriends = () => {
      navigation.navigate("FRIENDS", { user });
    };

    const goToEditBio = () => {
      navigation.navigate("EDIT_BIO");
    };

    const renderTop = () => (
      <Top
        isUser
        user={user}
        numPosts={posts.length}
        scrollY={scrollY}
        onPressAddBio={goToEditBio}
        onPressFriends={goToFriends}
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
      </Screen>
    );
  },
  (prevProps, nextProps) =>
    prevProps.stale === nextProps.stale &&
    _.isEqual(prevProps.user, nextProps.user)
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
