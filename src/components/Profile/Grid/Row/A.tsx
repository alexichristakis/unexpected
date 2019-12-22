import React from "react";
import { View, StyleSheet } from "react-native";

import { PostType } from "unexpected-cloud/models/post";
import {
  SCREEN_WIDTH,
  IMAGE_GUTTER,
  NUM_COLUMNS,
  COLUMN_WIDTH
} from "@lib/styles";

export interface AProps {
  renderPost: (post: PostType, size: number) => JSX.Element;
  posts: PostType[];
}

export const ASizes = {
  large: COLUMN_WIDTH * 2 + IMAGE_GUTTER,
  small: COLUMN_WIDTH
};

const A: React.FC<AProps> = ({ renderPost, posts }) => {
  const version = Math.random() * 3;

  if (version < 1) {
    return (
      <View style={styles.container}>
        {renderPost(posts[0], ASizes.large)}
        <View style={styles.middleColumn}>
          {renderPost(posts[1], ASizes.small)}
          {renderPost(posts[2], ASizes.small)}
        </View>
        {renderPost(posts[3], ASizes.large)}
      </View>
    );
  } else if (version < 2) {
    return (
      <View style={styles.container}>
        <View style={styles.middleColumn}>
          {renderPost(posts[0], ASizes.small)}
          {renderPost(posts[1], ASizes.small)}
        </View>
        {renderPost(posts[2], ASizes.large)}
        {renderPost(posts[3], ASizes.large)}
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {renderPost(posts[2], ASizes.large)}
        {renderPost(posts[3], ASizes.large)}
        <View style={styles.middleColumn}>
          {renderPost(posts[0], ASizes.small)}
          {renderPost(posts[1], ASizes.small)}
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: IMAGE_GUTTER,
    marginVertical: IMAGE_GUTTER / 2
  },
  middleColumn: {
    justifyContent: "space-between",
    width: ASizes.small,
    height: ASizes.large
  }
});

export default A;
