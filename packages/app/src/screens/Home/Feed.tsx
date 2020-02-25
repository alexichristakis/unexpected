import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, TextInput } from "react-native";

import { RouteProp } from "@react-navigation/core";
import { useScrollToTop } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _ from "lodash";
import Animated from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import { CommentsModal } from "@components/Comments";
import { Posts } from "@components/Feed";
import {
  ModalListRef,
  ZoomedImage,
  ZoomedImageType
} from "@components/universal";
import { hideStatusBarOnScroll } from "@hooks";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

import { ParamList } from "../../App";

const { Value } = Animated;

const mapStateToProps = (state: RootState) => ({
  stale: selectors.feedStale(state),
  lastFetched: selectors.lastFetched(state),
  phoneNumber: selectors.phoneNumber(state)
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
  ({ stale, navigation, phoneNumber, fetchFeed }) => {
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
      fetchFeed();
    }, [stale]);

    const handleOnPressUser = (userPhoneNumber: string) => {
      if (phoneNumber === userPhoneNumber) {
        navigation.navigate("USER_PROFILE_TAB");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: { prevRoute: "Feed", phoneNumber: userPhoneNumber }
        });
      }
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
    const handleOnCommentModalClose = () => setCommentsPostId("");

    return (
      <Screen style={styles.container}>
        <Posts
          scrollRef={scrollRef}
          scrollY={scrollY}
          onPressComposeComment={handleOnPressComposeCommment}
          onPressMoreComments={handleOnPressMoreComments}
          onGestureBegan={setZoomedImage}
          onGestureComplete={handleOnGestureComplete}
          onPressUser={handleOnPressUser}
          onPressShare={handleOnPressShare}
        />
        {zoomedImage && <ZoomedImage {...zoomedImage} />}
        <StatusBar />
        <CommentsModal
          onClose={handleOnCommentModalClose}
          textInputRef={textInputRef}
          modalRef={modalRef}
          postId={commentsPostId}
        />
      </Screen>
    );
  },
  (prevProps, nextProps) =>
    prevProps.stale === nextProps.stale &&
    prevProps.lastFetched === nextProps.lastFetched
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
