import React, { useState, useEffect } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  ViewProps,
  ViewStyle,
  FlatListProps,
  ScrollViewProps
} from "react-native";

import Animated, { Easing } from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { FeedPostType } from "unexpected-cloud/models/post";
import { UserType } from "unexpected-cloud/models/user";

import { Post } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export interface PostsProps extends ViewProps {
  scrollY?: Animated.Value<number>;
  onPressPost?: (post: FeedPostType) => void;
  onPressUser?: (user: UserType) => void;
  ListHeaderComponentStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any>;
  posts: FeedPostType[];
}
export const Posts: React.FC<PostsProps> = React.memo(
  ({
    scrollY,
    posts,
    onPressPost = () => {},
    onPressUser = () => {},
    ListHeaderComponent,
    ListHeaderComponentStyle,
    style,
    ...rest
  }) => {
    const [animatedValue] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease
      }).start();
    }, [posts.length]);

    const renderPost = ({ item, index }: ListRenderItemInfo<FeedPostType>) => (
      <Post
        entranceAnimatedValue={animatedValue}
        index={index}
        onPressPhoto={() => onPressPost(item)}
        onPressName={() => onPressUser(item.user)}
        post={item}
      />
    );

    return (
      <AnimatedFlatList
        style={style}
        onScroll={onScroll({ y: scrollY })}
        scrollEventThrottle={16}
        ListHeaderComponentStyle={ListHeaderComponentStyle}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50, alignItems: "center" }}
        data={posts}
        renderItem={renderPost}
        {...rest}
      />
    );
  },
  ({ posts: prevPosts }, { posts: nextPosts }) =>
    prevPosts.length === nextPosts.length
);
