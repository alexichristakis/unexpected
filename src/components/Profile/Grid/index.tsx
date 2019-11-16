import React from "react";
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  ViewStyle
} from "react-native";
import { PostType } from "unexpected-cloud/models/post";

// import { SquarePost } from "./SquarePost";
import { PostImage } from "@components/universal";
import { SCREEN_WIDTH } from "@lib/styles";

export interface GridProps {
  onScroll?: any;
  ListHeaderComponentStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any>;
  posts: PostType[];
}

const Grid: React.FC<GridProps> = ({
  ListHeaderComponentStyle,
  ListHeaderComponent,
  onScroll,
  posts
}) => {
  const renderPost = ({ item }: ListRenderItemInfo<PostType>) => (
    <PostImage
      width={(SCREEN_WIDTH - 40) / 3}
      height={(SCREEN_WIDTH - 40) / 3}
      phoneNumber={item.userPhoneNumber}
      id={item.photoId}
    />
  );

  return (
    <Animated.FlatList
      style={{ height: "100%", width: "100%" }}
      onScroll={onScroll}
      ListHeaderComponentStyle={ListHeaderComponentStyle}
      ListHeaderComponent={ListHeaderComponent}
      numColumns={3}
      renderItem={renderPost}
      data={posts}
    />
  );
};

export { Grid };
