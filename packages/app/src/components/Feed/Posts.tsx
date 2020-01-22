import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  ViewToken
} from "react-native";

import { FeedPost, User } from "@unexpected/global";
import Animated, { Easing } from "react-native-reanimated";
import { onScroll } from "react-native-redash";

import {
  Button,
  Post,
  PostImage,
  ZoomedImageType,
  ZoomHandler,
  ZoomHandlerGestureBeganPayload,
  PostRef
} from "@components/universal";
import { FEED_POST_HEIGHT, FEED_POST_WIDTH } from "@lib/constants";
import { SB_HEIGHT } from "@lib/styles";

import { Top } from "./Top";

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 10,
  minimumViewTime: 100
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export interface PostsProps {
  scrollY: Animated.Value<number>;
  onGestureBegan: (image: ZoomedImageType) => void;
  onGestureComplete: () => void;
  onPressUser: (user: User) => void;
  onPressShare: () => void;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  latest?: Date;
  refreshing: boolean;
  posts: FeedPost[];
}

export const Posts: React.FC<PostsProps> = React.memo(
  ({
    scrollY,
    refreshing,
    posts,
    onScrollEndDrag,
    onGestureBegan,
    onGestureComplete,
    onPressUser,
    onPressShare,
    latest
  }) => {
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [animatedValue] = useState(new Animated.Value(0));

    const cellRefs = useRef<{ [id: string]: React.RefObject<PostRef | null> }>(
      {}
    );

    const onViewableItemsChangedRef = useRef(
      ({ changed }: { changed: ViewToken[] }) => {
        const refs = cellRefs.current;
        // console.log(refs);
        changed.forEach(change => {
          const ref = refs[change.item.id];
          console.log("ref:", ref);
          // if (!ref || !ref.current) return;
          if (change.isViewable) {
            ref.setVisible();
          } else {
            ref.setNotVisible();
          }
        });
      }
    );

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.quad
      }).start();
    }, [posts.length]);

    const renderTop = () => (
      <Top latest={latest} refreshing={refreshing} scrollY={scrollY} />
    );

    const renderEmptyComponent = () => (
      <Button
        white
        title="share your first photo"
        style={{ marginHorizontal: 20 }}
        onPress={onPressShare}
      />
    );

    const renderPost = ({ item, index }: ListRenderItemInfo<FeedPost>) => {
      const { photoId, userPhoneNumber } = item;

      const handleOnPressName = () => onPressUser(item.user);
      const handleOnGestureBegan = (
        payload: ZoomHandlerGestureBeganPayload
      ) => {
        setScrollEnabled(false);
        onGestureBegan({
          ...payload,
          width: FEED_POST_WIDTH,
          height: FEED_POST_HEIGHT,
          id: photoId,
          phoneNumber: userPhoneNumber
        });
      };

      const handleOnGestureComplete = () => {
        setScrollEnabled(true);
        onGestureComplete();
      };

      const renderImage = () => (
        <ZoomHandler
          onGestureComplete={handleOnGestureComplete}
          onGestureBegan={handleOnGestureBegan}
        >
          <PostImage
            width={FEED_POST_WIDTH}
            height={FEED_POST_HEIGHT}
            phoneNumber={userPhoneNumber}
            id={photoId}
          />
        </ZoomHandler>
      );

      return (
        <Post
          ref={ref => (cellRefs.current[item.id] = ref)}
          index={index}
          post={item}
          renderImage={renderImage}
          entranceAnimatedValue={animatedValue}
          onPressName={handleOnPressName}
        />
      );
    };

    return (
      <AnimatedFlatList
        style={styles.container}
        data={posts}
        renderItem={renderPost}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        windowSize={3}
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        viewabilityConfig={VIEWABILITY_CONFIG}
        ListHeaderComponent={renderTop}
        ListHeaderComponentStyle={styles.headerContainer}
        ListEmptyComponent={renderEmptyComponent}
        onScrollEndDrag={onScrollEndDrag}
        contentContainerStyle={styles.contentContainer}
        scrollEventThrottle={16}
        onScroll={onScroll({ y: scrollY })}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.posts.length === nextProps.posts.length &&
    prevProps.refreshing === nextProps.refreshing
);

const styles = StyleSheet.create({
  container: {
    width: "100%"
  },
  contentContainer: {
    paddingTop: SB_HEIGHT(),
    paddingBottom: 50,
    alignItems: "center"
  },
  headerContainer: {
    zIndex: 1,
    alignSelf: "stretch"
  }
});
