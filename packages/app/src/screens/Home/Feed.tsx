import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, TextInput, FlatList } from "react-native";

import { useScrollToTop } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _ from "lodash";
import Haptics from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import { Posts } from "@components/Feed";
import {
  ZoomedImage,
  ZoomedImageType,
  ModalListRef
} from "@components/universal";
import { CommentsModal } from "@components/Comments";
import { hideStatusBarOnScroll } from "@hooks";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

import { ParamList } from "../../App";

const { Value } = Animated;

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
  navigation: NativeStackNavigationProp<ParamList, "FEED">;
  route: RouteProp<ParamList, "FEED">;
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
    const [commentsPostId, setCommentsPostId] = useState("");
    const [zoomedImage, setZoomedImage] = useState<ZoomedImageType>();
    const [scrollY] = useState(new Value(0));

    const textInputRef = useRef<TextInput>(null);
    const scrollRef = useRef<FlatList>(null);
    const modalRef = useRef<ModalListRef>(null);

    const StatusBar = hideStatusBarOnScroll(scrollY, "dark-content");

    // @ts-ignore
    useScrollToTop(scrollRef);

    useEffect(() => {
      // fetchFeed();
      // if (shouldLaunchPermissions) {
      //   setTimeout(() => navigation.navigate("PERMISSIONS"), 100);
      // }
    }, [stale]);

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

    const handleOnRefresh = () => {
      Haptics.trigger("impactMedium");
      fetchFeed();
    };

    const handleOnPressShare = () => navigation.navigate("CAPTURE");

    const handleOnPressMoreComments = (postId: string) => {
      setCommentsPostId(postId);
      modalRef.current?.open();
    };

    const handleOnPressComposeCommment = (postId: string) => {
      setCommentsPostId(postId);
      modalRef.current?.openFully();
      setTimeout(textInputRef.current?.focus, 100);
    };

    const handleOnGestureComplete = () => setZoomedImage(undefined);

    return (
      <Screen style={styles.container}>
        <Posts
          scrollRef={scrollRef}
          scrollY={scrollY}
          onPressComposeComment={handleOnPressComposeCommment}
          onPressMoreComments={handleOnPressMoreComments}
          refreshing={refreshing}
          onRefresh={handleOnRefresh}
          onGestureBegan={setZoomedImage}
          onGestureComplete={handleOnGestureComplete}
          onPressUser={handleOnPressUser}
          onPressShare={handleOnPressShare}
        />
        {zoomedImage && <ZoomedImage {...zoomedImage} />}
        <StatusBar />
        <CommentsModal
          textInputRef={textInputRef}
          modalRef={modalRef}
          postId={commentsPostId}
        />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
