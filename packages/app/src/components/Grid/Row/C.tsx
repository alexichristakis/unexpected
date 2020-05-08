import React from "react";
import { StyleSheet, View } from "react-native";

import { Post } from "@unexpected/global";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib";

export interface CProps {
  renderPost: (post: Post, size: number) => JSX.Element;
  posts: Post[];
}

export const CSizes = {
  large: COLUMN_WIDTH(5, 3) + 2 * IMAGE_GUTTER,
  medium: COLUMN_WIDTH(5, 2) + IMAGE_GUTTER,
  small: COLUMN_WIDTH(5),
};

const C: React.FC<CProps> = ({ renderPost, posts }) => {
  const renderColumn = () => {
    if (Math.random() < 0.5) {
      return (
        <View style={styles.column}>
          {renderPost(posts[1], CSizes.medium)}
          <View style={styles.row}>
            {renderPost(posts[2], CSizes.small)}
            {renderPost(posts[3], CSizes.small)}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.column}>
        <View style={styles.row}>
          {renderPost(posts[2], CSizes.small)}
          {renderPost(posts[3], CSizes.small)}
        </View>
        {renderPost(posts[1], CSizes.medium)}
      </View>
    );
  };

  if (Math.random() < 0.5) {
    return (
      <View style={styles.container}>
        {renderColumn()}
        {renderPost(posts[0], CSizes.large)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderPost(posts[0], CSizes.large)}
      {renderColumn()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: IMAGE_GUTTER,
    marginVertical: IMAGE_GUTTER / 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: CSizes.medium,
  },
  column: {
    justifyContent: "space-between",
    width: CSizes.medium,
    height: CSizes.large,
  },
});

export default C;
