import React, { useCallback, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import {
  RouteProp,
  useFocusEffect,
  useIsFocused
} from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { FeedPostType, PostType } from "unexpected-cloud/models/post";
import { UserType } from "unexpected-cloud/models/user";

import { Posts } from "@components/Feed";
import { Top } from "@components/Feed/Top";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import uuid from "uuid/v4";
import { StackParamList } from "../../App";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state),
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
  ({ navigation, phoneNumber, feed, fetchFeed }) => {
    const [scrollY] = useState(new Animated.Value(0));
    // const [onScroll] = useState(
    //   Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    //     useNativeDriver: true
    //   })
    // );

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
      if (phoneNumber === user.phoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({ name: "PROFILE", key: uuid(), params: { user } });
      }
    };

    const renderTop = () => <Top scrollY={scrollY} />;

    return (
      <Screen style={styles.container}>
        <Posts
          onScroll={onScroll({ y: scrollY })}
          onPressPost={handleOnPressPost}
          onPressUser={handleOnPressUser}
          ListHeaderComponentStyle={styles.headerContainer}
          ListHeaderComponent={renderTop}
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
  },
  headerContainer: {
    zIndex: 1,
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
