import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  ListRenderItemInfo,
  RefreshControl,
  Text,
  View,
  Animated as RNAnimated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";

import Animated, { Easing } from "react-native-reanimated";
import {
  RouteProp,
  useFocusEffect,
  useIsFocused
} from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { PostType, FeedPostType } from "unexpected-cloud/models/post";
import { UserType } from "unexpected-cloud/models/user";
import { onScroll } from "react-native-redash";

import { Post } from "@components/universal";
import { Top, Posts } from "@components/Feed";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import uuid from "uuid/v4";
import { StackParamList } from "../../App";

const {
  Value,
  block,
  cond,
  call,
  and,
  lessThan,
  greaterOrEq,
  useCode
} = Animated;

const AnimatedFlatList: typeof FlatList = Animated.createAnimatedComponent(
  FlatList
);

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state),
  feed: selectors.feedState(state),
  refreshing: selectors.postLoading(state)
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
  ({ navigation, phoneNumber, feed, fetchFeed, refreshing }) => {
    const [readyForRefresh, setReadyForRefresh] = useState<0 | 1>(1);

    const [scrollY] = useState(new Value(0));
    const [animatedValue] = useState(new Animated.Value(0));
    const postsRef = useRef<typeof AnimatedFlatList>(null);

    useFocusEffect(
      useCallback(() => {
        if (feed.stale) fetchFeed();
      }, [feed.stale])
    );

    useCode(
      () =>
        block([
          cond(
            lessThan(scrollY, -100),
            call([], ([]) => setReadyForRefresh(1))
          ),
          cond(
            greaterOrEq(scrollY, -100),
            call([], ([]) => setReadyForRefresh(0))
          )
        ]),
      [readyForRefresh]
    );

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.quad
      }).start();
    }, [feed.posts.length]);

    const handleScrollEndDrag = ({
      nativeEvent
    }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {
        contentOffset: { y }
      } = nativeEvent;
      if (y < -100) {
        fetchFeed();
      }
    };

    const renderPost = ({ item, index }: ListRenderItemInfo<FeedPostType>) => (
      <Post
        entranceAnimatedValue={animatedValue}
        index={index}
        onPressPhoto={() => handleOnPressPost(item)}
        onPressName={() => handleOnPressUser(item.user)}
        post={item}
      />
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

    const renderTop = () => (
      <Top
        readyForRefresh={readyForRefresh}
        refreshing={refreshing}
        scrollY={scrollY}
      />
    );

    return (
      <Screen style={styles.container}>
        <AnimatedFlatList
          onScrollEndDrag={handleScrollEndDrag}
          onScroll={onScroll({ y: scrollY })}
          scrollEventThrottle={16}
          ListHeaderComponentStyle={styles.headerContainer}
          ListHeaderComponent={renderTop}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50, alignItems: "center" }}
          data={feed.posts}
          renderItem={renderPost}
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
