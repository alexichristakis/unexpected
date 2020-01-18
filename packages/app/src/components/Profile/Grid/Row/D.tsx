import React from "react";
import { StyleSheet, View } from "react-native";

import { Post } from "@unexpected/global";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib/constants";

export interface DProps {
  renderPost: (post: Post, size: number) => JSX.Element;
  posts: Post[];
}

export const DSizes = {
  large: COLUMN_WIDTH(5, 2) + IMAGE_GUTTER,
  small: COLUMN_WIDTH(5, 1)
};

const D: React.FC<DProps> = ({ renderPost, posts }) => {
  const version = Math.random() * 3;

  if (version < 1) {
    return (
      <View style={styles.container}>
        {renderPost(posts[0], DSizes.large)}
        <View style={styles.middleColumn}>
          {renderPost(posts[1], DSizes.small)}
          {renderPost(posts[2], DSizes.small)}
        </View>
        {renderPost(posts[3], DSizes.large)}
      </View>
    );
  }

  if (version < 2) {
    return (
      <View style={styles.container}>
        <View style={styles.middleColumn}>
          {renderPost(posts[0], DSizes.small)}
          {renderPost(posts[1], DSizes.small)}
        </View>
        {renderPost(posts[2], DSizes.large)}
        {renderPost(posts[3], DSizes.large)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderPost(posts[2], DSizes.large)}
      {renderPost(posts[3], DSizes.large)}
      <View style={styles.middleColumn}>
        {renderPost(posts[0], DSizes.small)}
        {renderPost(posts[1], DSizes.small)}
      </View>
    </View>
  );
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
    width: DSizes.small,
    height: DSizes.large
  }
});

export default D;
