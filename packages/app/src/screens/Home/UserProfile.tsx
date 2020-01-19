import React, { useCallback, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import isEqual from "lodash/isEqual";
import Haptics from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import { Top } from "@components/Profile";
import { Grid } from "@components/Profile/Grid";
import { SB_HEIGHT } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Post } from "@unexpected/global";
import { StackParamList } from "../../App";

const mapStateToProps = (state: RootState) => ({
  postsLoading: selectors.postLoading(state),
  user: selectors.currentUser(state),
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
  ({
    navigation,
    fetchUser,
    fetchUsersPosts,
    stale,
    posts,
    postsLoading,
    user
  }) => {
    const [scrollY] = useState(new Animated.Value(0));

    useFocusEffect(
      useCallback(() => {
        StatusBar.setHidden(false);
        fetchUser();

        if (stale) fetchUsersPosts();

        return () => {};
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
        isUser={true}
        user={user}
        numPosts={posts.length}
        scrollY={scrollY}
        onPressAddBio={goToEditBio}
        onPressFriends={goToFriends}
        onPressImage={goToNewProfilePicture}
        onPressName={goToSettings}
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
        fetchUser();
        fetchUsersPosts();
      }
    };

    return (
      <Screen style={styles.container}>
        <Grid
          loading={postsLoading}
          onPressPost={handleOnPressPost}
          scrollY={scrollY}
          onScrollEndDrag={handleOnScrollEndDrag}
          ListHeaderComponentStyle={styles.headerContainer}
          ListHeaderComponent={renderTop}
          posts={posts}
        />
      </Screen>
    );
  },
  (prevProps, nextProps) =>
    prevProps.stale === nextProps.stale &&
    isEqual(prevProps.user, nextProps.user)
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

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
