import React from "react";
import { StyleSheet, View } from "react-native";

import { Post } from "@unexpected/global";
import random from "lodash/random";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib/constants";

export interface DProps {
  renderPost: (post: Post, size: number) => JSX.Element;
  posts: Post[];
}

export const DSizes = {
  large: COLUMN_WIDTH(5, 4) + 3 * IMAGE_GUTTER,
  small: COLUMN_WIDTH(5, 1)
};

const D: React.FC<DProps> = ({ renderPost, posts }) => {
  const version = random(1);

  if (version) {
    return (
      <View style={styles.container}>
        {renderPost(posts[0], DSizes.large)}
        <View style={styles.column}>
          {renderPost(posts[1], DSizes.small)}
          {renderPost(posts[2], DSizes.small)}
          {renderPost(posts[3], DSizes.small)}
          {renderPost(posts[4], DSizes.small)}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        {renderPost(posts[1], DSizes.small)}
        {renderPost(posts[2], DSizes.small)}
        {renderPost(posts[3], DSizes.small)}
        {renderPost(posts[4], DSizes.small)}
      </View>
      {renderPost(posts[0], DSizes.large)}
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
  column: {
    justifyContent: "space-between",
    width: DSizes.small,
    height: DSizes.large
  }
});

export default D;
