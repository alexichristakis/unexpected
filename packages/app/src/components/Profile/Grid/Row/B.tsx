import React from "react";
import { StyleSheet, View } from "react-native";

import { Post } from "@unexpected/global";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib/styles";

export interface BProps {
  renderPost: (post: Post, size: number) => JSX.Element;
  posts: Post[];
}

export const BSizes = {
  large: COLUMN_WIDTH * 2 + IMAGE_GUTTER,
  small: COLUMN_WIDTH
};

const B: React.FC<BProps> = ({ renderPost, posts }) => {
  const version = Math.random() * 3;

  if (version < 1) {
    return (
      <View style={styles.container}>
        {renderPost(posts[0], BSizes.large)}
        <View style={styles.middleColumn}>
          {renderPost(posts[1], BSizes.small)}
          {renderPost(posts[2], BSizes.small)}
        </View>
        {renderPost(posts[3], BSizes.large)}
      </View>
    );
  }

  if (version < 2) {
    return (
      <View style={styles.container}>
        <View style={styles.middleColumn}>
          {renderPost(posts[0], BSizes.small)}
          {renderPost(posts[1], BSizes.small)}
        </View>
        {renderPost(posts[2], BSizes.large)}
        {renderPost(posts[3], BSizes.large)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderPost(posts[2], BSizes.large)}
      {renderPost(posts[3], BSizes.large)}
      <View style={styles.middleColumn}>
        {renderPost(posts[0], BSizes.small)}
        {renderPost(posts[1], BSizes.small)}
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
    width: BSizes.small,
    height: BSizes.large
  }
});

export default B;
