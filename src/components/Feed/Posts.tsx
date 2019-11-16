import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  ViewProps,
  ViewStyle,
  TouchableOpacity
} from "react-native";
import { FeedPostType } from "unexpected-cloud/controllers/post";
import { UserType } from "unexpected-cloud/models/user";

import { Post } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";

export interface PostsProps extends ViewProps {
  onPressPost?: (post: FeedPostType) => void;
  onPressUser?: (user: UserType) => void;
  ListHeaderComponentStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any>;
  posts: FeedPostType[];
}
export const Posts: React.FC<PostsProps> = React.memo(
  ({
    posts,
    onPressPost = () => {},
    onPressUser = () => {},
    ListHeaderComponent,
    ListHeaderComponentStyle,
    style
  }) => {
    console.log("render posts");

    const renderPost = ({ item }: ListRenderItemInfo<FeedPostType>) => (
      <Post
        onPressPhoto={() => onPressPost(item)}
        onPressName={() => onPressUser(item.user)}
        post={item}
      />
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
