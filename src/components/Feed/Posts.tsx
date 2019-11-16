import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  ViewProps,
  ViewStyle
} from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { Post } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";

export interface PostsProps extends ViewProps {
  ListHeaderComponentStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any>;
  posts: PostType[];
}
export const Posts: React.FC<PostsProps> = React.memo(
  ({ posts, ListHeaderComponent, ListHeaderComponentStyle, style }) => {
    console.log("render posts");

    const renderPost = ({ item }: ListRenderItemInfo<PostType>) => (
      <Post post={item} />
    );

    return (
      <FlatList
        ListHeaderComponentStyle={ListHeaderComponentStyle}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={{ paddingBottom: 100, alignItems: "center" }}
        data={posts}
        renderItem={renderPost}
      />
    );
  },
  ({ posts: prevPosts }, { posts: nextPosts }) =>
    prevPosts.length === nextPosts.length
);
