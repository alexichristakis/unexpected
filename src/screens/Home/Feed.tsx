import { useNavigation } from "@react-navigation/core";
import { useFocusEffect, useIsFocused } from "@react-navigation/core";
import React, { useCallback } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen, ScreenProps } from "react-native-screens";
import { connect } from "react-redux";

import { StackParamList } from "../../App";
import { Posts } from "@components/Profile";
import { UserImage } from "@components/universal";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as ImageActions } from "@redux/modules/image";
import {
  Actions as PermissionsActions,
  Permissions
} from "@redux/modules/permissions";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

const mapStateToProps = (state: RootState) => ({
  feed: selectors.feedState(state)
});
const mapDispatchToProps = {
  fetchFeed: PostActions.fetchFeed
};

export type FeedReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface FeedOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "FEED">;
  route: RouteProp<StackParamList, "FEED">;
}
export type FeedProps = FeedReduxProps & FeedOwnProps;

export const Feed: React.FC<FeedProps> = React.memo(
  ({ navigation, feed, fetchFeed }) => {
    useFocusEffect(
      useCallback(() => {
        if (feed.stale) fetchFeed();
      }, [feed.stale])
    );

    const getPosts = () => {
      return feed.posts;
    };

    return (
      <Screen style={styles.container}>
        <Button
          title="permissions"
          onPress={() => navigation.navigate("PERMISSIONS")}
        />
        <Posts posts={getPosts()} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100
    // justifyContent: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
