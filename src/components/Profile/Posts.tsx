import React from "react";
import { FlatList } from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { PostImage } from "@components/universal";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "@lib/styles";

export interface PostsProps {
  posts: PostType[];
}
export const Posts: React.FC<PostsProps> = React.memo(({ posts }) => {
  return (
    <FlatList
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      data={posts}
      renderItem={({ item }) => (
        <PostImage
          width={SCREEN_WIDTH}
          height={SCREEN_WIDTH * 1.2}
          phoneNumber={item.userPhoneNumber}
          id={item.photoId}
        />
      )}
    />
  );
});
