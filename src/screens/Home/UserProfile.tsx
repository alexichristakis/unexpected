import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/core";
import React, { useCallback, useState } from "react";
import { Animated, Button, StyleSheet } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import { Screen, ScreenProps } from "react-native-screens";
import { connect } from "react-redux";

import { Posts, Top } from "@components/Profile";
import { Header } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { routes } from "../index";

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
export interface UserProfileOwnProps {}
export type UserProfileProps = UserProfileOwnProps & UserProfileReduxProps;

export const UserProfile: React.FC<UserProfileProps> = React.memo(
  ({ fetchUsersPosts, stale, posts }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const { bottom, top } = useSafeArea();
    const isFocused = useIsFocused();

    const navigation = useNavigation();

    useFocusEffect(
      useCallback(() => {
        fetchUsersPosts();
      }, [stale])
    );

    return (
      <Screen style={styles.container}>
        <Top />
        <Button title="go to settings" onPress={() => navigation.navigate(routes.Settings)} />
        <Posts posts={posts} />
        <Header title="Alexi Christakis" scrollY={scrollY} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "blue",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserProfile);
