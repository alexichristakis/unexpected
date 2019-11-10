import React, { useState, useCallback } from "react";
import { StyleSheet, Animated, Button } from "react-native";
import { useNavigation, useFocusEffect, useIsFocused } from "@react-navigation/core";
import { useSafeArea } from "react-native-safe-area-context";
import { connect } from "react-redux";
import { Screen, ScreenProps } from "react-native-screens";

import * as selectors from "@redux/selectors";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import { RootState, ReduxPropsType } from "@redux/types";
import { Header } from "@components/universal";
import { Top, Posts } from "@components/Profile";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";
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
export interface UserProfileProps {}

const UserProfile: React.FC<UserProfileProps & UserProfileReduxProps> = React.memo(
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
