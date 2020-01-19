import React, { useEffect, useState, useMemo, useRef, createRef } from "react";
import {
  View,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  ViewToken
} from "react-native";

import Animated, { Easing } from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { User, FeedPost } from "@unexpected/global";

import {
  Button,
  Post,
  PostImage,
  ZoomedImageType,
  ZoomHandler,
  ZoomHandlerGestureBeganPayload
} from "@components/universal";
import { SB_HEIGHT } from "@lib/styles";
import { FEED_POST_HEIGHT, FEED_POST_WIDTH } from "@lib/constants";

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
    const [viewableItems, setViewableItems] = useState<(number | null)[]>([]);

    // const cellRefs = useRef<{ [id: string]: React.RefObject<typeof Post> }>({});
    // const onViewableItemsChangedRef = useRef(
    //   ({ changed }: { changed: ViewToken[] }) => {
    //     // const refs = cellRefs.current;
    //     // changed.forEach(change => {
    //     //   const ref = refs[change.item.id];
    //     //   if (!ref || !ref.current) return;
    //     //   if (change.isViewable) {
    //     //     ref.current.setVisible();
    //     //   } else {
    //     //     ref.current.setNotVisible();
    //     //   }
    //     // });
    //   }
    // );

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
          // ref={cellRefs.current[item.id]}
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
        // onViewableItemsChanged={onViewableItemsChangedRef.current}
        // viewabilityConfig={VIEWABILITY_CONFIG}
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
