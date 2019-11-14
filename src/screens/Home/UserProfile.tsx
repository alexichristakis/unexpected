import React, { useCallback, useState } from "react";
import { Animated, Button, StyleSheet, Text } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Posts, Top } from "@components/Profile";
import { Header, UserImage } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../../App";

const mapStateToProps = (state: RootState) => ({
  user: selectors.user(state),
  posts: selectors.usersPosts(state),
  stale: selectors.usersPostsStale(state)
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

    useFocusEffect(
      useCallback(() => {
        if (stale) fetchUsersPosts();
      }, [stale])
    );

    const goToNewProfilePicture = () => {
      navigation.navigate("NEW_PROFILE_PICTURE");
    };

    const goToSettings = () => {
      navigation.navigate("SETTINGS");
    };

    return (
      <Screen style={styles.container}>
        <Posts
          ListHeaderComponentStyle={styles.headerContainer}
          ListHeaderComponent={() => (
            <Top
              user={user}
              onPressImage={goToNewProfilePicture}
              onPressName={goToSettings}
            />
          )}
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
    alignItems: "center",
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
