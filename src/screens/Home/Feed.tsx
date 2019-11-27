import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  ListRenderItemInfo,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar
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
import { Top } from "@components/Feed";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import uuid from "uuid/v4";
import { StackParamList } from "../../App";
import { SB_HEIGHT } from "@lib/styles";

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
  refreshing: selectors.postLoading(state),
  shouldLaunchPermissions: selectors.shouldLaunchPermissions(state)
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
  ({
    navigation,
    phoneNumber,
    feed,
    fetchFeed,
    refreshing,
    shouldLaunchPermissions
  }) => {
    const [readyForRefresh, setReadyForRefresh] = useState<0 | 1>(1);
    const [statusBarVisible, setStatusBarVisible] = useState(true);
    const [entranceAnimatedValue] = useState(new Animated.Value(0));
    const [statusBarAnimatedValue] = useState(new Animated.Value(0));
    const [scrollY] = useState(new Value(0));

    useEffect(() => {
      console.log("launch", shouldLaunchPermissions);
      if (shouldLaunchPermissions) {
        setTimeout(() => navigation.navigate("PERMISSIONS"), 100);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        if (statusBarVisible) {
          StatusBar.setHidden(false);
        } else {
          StatusBar.setHidden(true);
        }
        fetchFeed();
      }, [statusBarVisible])
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
          ),
          cond(
            greaterOrEq(scrollY, 40),
            call([], ([]) => hideStatusBar()),
            call([], ([]) => showStatusBar())
          )
        ]),
      [readyForRefresh]
    );

    useEffect(() => {
      Animated.timing(entranceAnimatedValue, {
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
        entranceAnimatedValue={entranceAnimatedValue}
        index={index}
        onPressPhoto={() => handleOnPressPost(item)}
        onPressName={() => handleOnPressUser(item.user)}
        post={item}
      />
    );

    const animatedStatusBarStyle = {
      transform: [{ translateY: statusBarAnimatedValue }]
    };

    const showStatusBar = () => {
      setStatusBarVisible(true);
      StatusBar.setHidden(false, "slide");
      Animated.timing(statusBarAnimatedValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease
      }).start();
    };

    const hideStatusBar = () => {
      setStatusBarVisible(false);
      StatusBar.setHidden(true, "slide");
      Animated.timing(statusBarAnimatedValue, {
        toValue: -SB_HEIGHT(),
        duration: 200,
        easing: Easing.ease
      }).start();
    };

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
          contentContainerStyle={{
            paddingTop: SB_HEIGHT(),
            paddingBottom: 50,
            alignItems: "center"
          }}
          data={getPosts()}
          renderItem={renderPost}
        />
        <Animated.View style={[styles.statusBar, animatedStatusBarStyle]} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  statusBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: SB_HEIGHT(),
    backgroundColor: "white"
  },
  headerContainer: {
    zIndex: 1,
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
