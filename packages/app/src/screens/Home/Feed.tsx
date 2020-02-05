import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  FlatList
} from "react-native";

import { useScrollToTop } from "@react-navigation/native";
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

import { StackParamList } from "../../App";
import { hideStatusBarOnScroll } from "@hooks";

const { Value, block, cond, call, greaterOrEq, useCode } = Animated;

const mapStateToProps = (state: RootState) => ({
  stale: selectors.feedStale(state),
  phoneNumber: selectors.phoneNumber(state),
  refreshing: selectors.feedLoading(state),
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
    stale,
    navigation,
    phoneNumber,
    fetchFeed,
    refreshing,
    shouldLaunchPermissions
  }) => {
    const [zoomedImage, setZoomedImage] = useState<ZoomedImageType>();
    const [scrollY] = useState(new Value(0));
    const scrollRef = useRef<FlatList>(null);

    const animatedStatusBarStyle = hideStatusBarOnScroll(scrollY);

    // @ts-ignore
    useScrollToTop(scrollRef);

    useEffect(() => {
      // fetchFeed();

      if (shouldLaunchPermissions) {
        setTimeout(() => navigation.navigate("PERMISSIONS"), 100);
      }
    }, []);

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

    const handleOnPressUser = (userPhoneNumber: string) => {
      if (phoneNumber === userPhoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: { prevRoute: "Feed", phoneNumber: userPhoneNumber }
        });
      }
    };

    const handleOnPressShare = () => {
      navigation.navigate("CAPTURE");
    };

    const handleOnGestureComplete = () => setZoomedImage(undefined);

    return (
      <Screen style={styles.container}>
        <Posts
          scrollRef={scrollRef}
          scrollY={scrollY}
          refreshing={refreshing}
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
