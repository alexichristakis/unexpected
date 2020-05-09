import React from "react";
import { StyleSheet, View } from "react-native";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib";

export interface CProps {
  renderPost: (id: string, size: number) => JSX.Element;
  posts: string[];
}

export const CSizes = {
  large: COLUMN_WIDTH(3),
  small: COLUMN_WIDTH(1),
};

const C: React.FC<CProps> = ({ renderPost, posts }) => {
  if (Math.random() < 0.5)
    return (
      <View style={styles.container}>
        {renderPost(posts[0], CSizes.large)}
        <View style={styles.column}>
          {renderPost(posts[1], CSizes.small)}
          {renderPost(posts[2], CSizes.small)}
          {renderPost(posts[3], CSizes.small)}
        </View>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        {renderPost(posts[1], CSizes.small)}
        {renderPost(posts[2], CSizes.small)}
        {renderPost(posts[3], CSizes.small)}
      </View>
      {renderPost(posts[0], CSizes.large)}
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
  column: {
    justifyContent: "space-between",
    width: CSizes.small,
    height: CSizes.large,
  },
});

export default C;
