import React, { useCallback, useEffect, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _ from "lodash";
import Haptics from "react-native-haptic-feedback";
import Animated, { Easing } from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import { Posts } from "@components/Feed";
import { ZoomedImage, ZoomedImageType } from "@components/universal";
import { SB_HEIGHT } from "@lib/styles";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { User } from "@unexpected/global";
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
    const [statusBarVisible, setStatusBarVisible] = useState(true);
    const [statusBarAnimatedValue] = useState(new Value(0));
    const [scrollY] = useState(new Value(0));
    const [zoomedImage, setZoomedImage] = useState<ZoomedImageType>();

    useEffect(() => {
      fetchFeed();

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

        return () => {};
      }, [statusBarVisible])
    );

    useCode(
      () =>
        block([
          cond(
            greaterOrEq(scrollY, 40),
            call([], ([]) => hideStatusBar()),
            call([], ([]) => showStatusBar())
          )
        ]),
      [statusBarVisible]
    );

    const animatedStatusBarStyle = {
      transform: [{ translateY: statusBarAnimatedValue }]
    };

    const showStatusBar = () => {
      if (!statusBarVisible) {
        setStatusBarVisible(true);
        StatusBar.setHidden(false, "slide");
        Animated.timing(statusBarAnimatedValue, {
          toValue: 0,
          duration: 150,
          easing: Easing.ease
        }).start();
      }
    };

    const hideStatusBar = () => {
      if (statusBarVisible) {
        setStatusBarVisible(false);
        StatusBar.setHidden(true, "slide");
        Animated.timing(statusBarAnimatedValue, {
          toValue: -SB_HEIGHT(),
          duration: 150,
          easing: Easing.ease
        }).start();
      }
    };

    const getPosts = () => {
      const sortedPosts = _.sortBy(feed.posts, o => -o.createdAt);
      const latest = sortedPosts.length ? sortedPosts[0].createdAt : undefined;

      return { sortedPosts, latest };
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
        fetchFeed();
      }
    };

    const handleOnPressUser = (user: User) => {
      if (phoneNumber === user.phoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: { prevRoute: "Feed", user }
        });
      }
    };

    const handleOnPressShare = () => {
      navigation.navigate("CAPTURE", { nextRoute: "SHARE" });
    };

    const handleOnGestureComplete = () => setZoomedImage(undefined);

    const { sortedPosts, latest } = getPosts();

    return (
      <Screen style={styles.container}>
        <Posts
          posts={sortedPosts}
          scrollY={scrollY}
          refreshing={refreshing}
          latest={latest}
          onScrollEndDrag={handleOnScrollEndDrag}
          onGestureBegan={setZoomedImage}
          onGestureComplete={handleOnGestureComplete}
          onPressUser={handleOnPressUser}
          onPressShare={handleOnPressShare}
        />
        {zoomedImage && <ZoomedImage {...zoomedImage} />}
        <Animated.View style={[styles.statusBar, animatedStatusBarStyle]} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 20,
    alignItems: "center"
  },
  statusBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: SB_HEIGHT(),
    backgroundColor: "white"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
