import React, { useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  ViewToken
} from "react-native";

import { Post as PostType, User } from "@unexpected/global";
import _ from "lodash";
import Animated from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import {
  Button,
  Post,
  PostImage,
  PostRef,
  ZoomedImageType,
  ZoomHandler,
  ZoomHandlerGestureBeganPayload
} from "@components/universal";
import { FEED_POST_HEIGHT, FEED_POST_WIDTH } from "@lib/constants";
import { SB_HEIGHT } from "@lib/styles";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import { Top } from "./Top";

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 10,
  minimumViewTime: 100
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const mapStateToProps = (state: RootState) => ({
  posts: selectors.feed(state)
});

const mapDispatchToProps = {};

export interface PostsProps {
  scrollY: Animated.Value<number>;
  refreshing: boolean;
  onGestureBegan: (image: ZoomedImageType) => void;
  onGestureComplete: () => void;
  onPressUser: (phoneNumber: string) => void;
  onPressShare: () => void;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export type PostConnectedProps = ConnectedProps<typeof connector>;

export type PostRefMap = { [id: string]: PostRef | null };

const Posts: React.FC<PostsProps & PostConnectedProps> = React.memo(
  ({
    scrollY,
    refreshing,
    posts,
    onScrollEndDrag,
    onGestureBegan,
    onGestureComplete,
    onPressUser,
    onPressShare
  }) => {
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const sortPosts = () => {
      const sortedPosts = _.sortBy(posts, ({ createdAt }) => -createdAt);
      const latest = sortedPosts.length ? sortedPosts[0].createdAt : undefined;

      return { sortedPosts, latest };
    };

    const cellRefs = useRef<PostRefMap>({});

    const onViewableItemsChangedRef = useRef(
      ({ changed }: { changed: ViewToken[] }) => {
        const refs = cellRefs.current;

        changed.forEach(change => {
          const ref = refs[change.item.id];

          if (change.isViewable) {
            ref?.setVisible();
          } else {
            ref?.setNotVisible();
          }
        });
      }
    );

    const { sortedPosts, latest } = sortPosts();

    const renderTop = () => (
      <Top latest={latest} refreshing={refreshing} scrollY={scrollY} />
    );

    const renderEmptyComponent = () => (
      <Button
        white={true}
        title="share your first photo"
        style={{ marginHorizontal: 20 }}
        onPress={onPressShare}
      />
    );

    const renderPost = ({ item, index }: ListRenderItemInfo<PostType>) => {
      const { id, photoId, phoneNumber } = item;

      const handleOnGestureBegan = (
        payload: ZoomHandlerGestureBeganPayload
      ) => {
        setScrollEnabled(false);
        onGestureBegan({
          ...payload,
          width: FEED_POST_WIDTH,
          height: FEED_POST_HEIGHT,
          id: photoId,
          phoneNumber
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
            phoneNumber={phoneNumber}
            id={photoId}
          />
        </ZoomHandler>
      );

      return (
        <Post
          ref={ref => (cellRefs.current[id] = ref)}
          onPressName={onPressUser}
          postId={id}
          renderImage={renderImage}
        />
      );
    };

    return (
      <AnimatedFlatList
        style={styles.container}
        data={sortedPosts}
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
  (prevProps, nextProps) => prevProps.refreshing === nextProps.refreshing
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Posts);
