import React from "react";
import { View, StyleSheet } from "react-native";

import { PostType } from "unexpected-cloud/models/post";
import { IMAGE_GUTTER, COLUMN_WIDTH } from "@lib/styles";

export interface CProps {
  renderPost: (post: PostType, size: number) => JSX.Element;
  posts: PostType[];
}

export const CSizes = {
  large: 3 * COLUMN_WIDTH + 2 * IMAGE_GUTTER,
  medium: 2 * COLUMN_WIDTH + IMAGE_GUTTER,
  small: COLUMN_WIDTH
};

const C: React.FC<CProps> = ({ renderPost, posts }) => {
  const version = Math.random();

  const renderColumn = () => {
    const columnVersion = Math.random();

    if (columnVersion < 0.5) {
      return (
        <View style={styles.column}>
          {renderPost(posts[1], CSizes.medium)}
          <View style={styles.row}>
            {renderPost(posts[2], CSizes.small)}
            {renderPost(posts[3], CSizes.small)}
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.column}>
          <View style={styles.row}>
            {renderPost(posts[2], CSizes.small)}
            {renderPost(posts[3], CSizes.small)}
          </View>
          {renderPost(posts[1], CSizes.medium)}
        </View>
      );
    }
  };

  if (version < 0.5) {
    return (
      <View style={styles.container}>
        {renderColumn()}
        {renderPost(posts[0], CSizes.large)}
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {renderPost(posts[0], CSizes.large)}
        {renderColumn()}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: CSizes.medium
  },
  column: {
    justifyContent: "space-between",
    width: CSizes.medium,
    height: CSizes.large
  }
});

export default C;
