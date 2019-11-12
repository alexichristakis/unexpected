import React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { Post } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";

export interface PostsProps {
  posts: PostType[];
}
export const Posts: React.FC<PostsProps> = React.memo(
  ({ posts }) => {
    console.log("render posts");

    const renderPost = ({ item }: ListRenderItemInfo<PostType>) => (
      <Post post={item} />
    );

    return (
      <FlatList
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        contentContainerStyle={{ paddingVertical: 100, alignItems: "center" }}
        data={posts}
        renderItem={renderPost}
      />
    );
  },
  ({ posts: prevPosts }, { posts: nextPosts }) =>
    prevPosts.length === nextPosts.length
);
