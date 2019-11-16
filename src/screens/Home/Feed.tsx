import React, { useCallback } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import {
  RouteProp,
  useFocusEffect,
  useIsFocused
} from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { FeedPostType } from "unexpected-cloud/controllers/post";
import { PostType } from "unexpected-cloud/models/post";
import { UserType } from "unexpected-cloud/models/user";

import { Posts } from "@components/Feed";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../../App";
import uuid from "uuid/v4";

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
export interface FeedProps extends FeedReduxProps {
  navigation: NativeStackNavigationProp<StackParamList, "FEED">;
  route: RouteProp<StackParamList, "FEED">;
}

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

    const handleOnPressPost = (post: FeedPostType) => {
      navigation.navigate({ name: "POST", key: uuid(), params: { post } });
    };

    const handleOnPressUser = (user: UserType) => {
      navigation.navigate({ name: "PROFILE", key: uuid(), params: { user } });
    };

    return (
      <Screen style={styles.container}>
        <Posts
          onPressPost={handleOnPressPost}
          onPressUser={handleOnPressUser}
          posts={feed.posts}
        />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40
    // justifyContent: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
