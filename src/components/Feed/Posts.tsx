import React, { useEffect, useState } from "react";
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  ViewStyle,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";

import Animated, { Easing } from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { FeedPostType } from "unexpected-cloud/models/post";
import { UserType } from "unexpected-cloud/models/user";

import {
  Button,
  Post,
  ZoomHandler,
  ZoomHandlerGestureBeganPayload,
  PostImage
} from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SB_HEIGHT } from "@lib/styles";

import { Top } from "./Top";
import { FocusedImageType, Measurement } from "./FocusedImage";

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

export interface PostsProps {
  scrollY: Animated.Value<number>;
  onGestureBegan: (image: FocusedImageType) => void;
  onGestureComplete: () => void;
  onPressPost: (post: FeedPostType) => void;
  onPressUser: (user: UserType) => void;
  onPressShare: () => void;
  handleScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  latest?: Date;
  refreshing: boolean;
  readyForRefresh: 0 | 1;
  posts: FeedPostType[];
}

export const Posts: React.FC<PostsProps> = React.memo(
  ({
    scrollY,
    refreshing,
    readyForRefresh,
    posts,
    onGestureBegan,
    onGestureComplete,
    onPressPost,
    onPressUser,
    onPressShare,
    latest
  }) => {
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [animatedValue] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.quad
      }).start();
    }, [posts.length]);

    const renderTop = () => (
      <Top
        latest={latest}
        readyForRefresh={readyForRefresh}
        refreshing={refreshing}
        scrollY={scrollY}
      />
    );

    const renderEmptyComponent = () => (
      <Button title="share your first photo" onPress={onPressShare} />
    );

    const renderPost = ({ item, index }: ListRenderItemInfo<FeedPostType>) => {
      const { photoId, userPhoneNumber } = item;

      const handleOnPressPhoto = () => onPressPost(item);
      const handleOnPressName = () => onPressUser(item.user);
      const handleOnGestureBegan = (
        payload: ZoomHandlerGestureBeganPayload
      ) => {
        setScrollEnabled(false);
        onGestureBegan({
          ...payload,
          id: photoId,
          phoneNumber: userPhoneNumber
        });
      };

      const handleOnGestureComplete = () => {
        setScrollEnabled(true);
        onGestureComplete();
      };

      return (
        <Post
          index={index}
          post={item}
          renderImage={() => (
            <ZoomHandler
              onGestureComplete={handleOnGestureComplete}
              onGestureBegan={handleOnGestureBegan}
            >
              <PostImage
                width={SCREEN_WIDTH - 40}
                height={(SCREEN_WIDTH - 40) * 1.2}
                phoneNumber={userPhoneNumber}
                id={photoId}
              />
            </ZoomHandler>
          )}
          entranceAnimatedValue={animatedValue}
          onPressName={handleOnPressName}
        />
      );
    };

    return (
      <FlatList
        data={posts}
        renderItem={renderPost}
        ListHeaderComponent={renderTop}
        ListHeaderComponentStyle={styles.headerContainer}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.contentContainer}
        renderScrollComponent={props => (
          <Animated.ScrollView
            {...props}
            scrollEnabled={scrollEnabled}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll({ y: scrollY })}
          />
        )}
      />
    );
  }
  // ({ posts: prevPosts }, { posts: nextPosts }) =>
  //   prevPosts.length === nextPosts.length
);

const styles = StyleSheet.create({
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
