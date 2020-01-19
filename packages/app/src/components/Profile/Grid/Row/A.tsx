import React from "react";
import { StyleSheet, View } from "react-native";

import { Post } from "@unexpected/global";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib/constants";

export interface AProps {
  renderPost: (post: Post, size: number) => JSX.Element;
  posts: Post[];
}

const A: React.FC<AProps> = ({ renderPost, posts }) => (
  <View style={styles.container}>
    {posts.map(post => renderPost(post, COLUMN_WIDTH(posts.length)))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: IMAGE_GUTTER,
    marginVertical: IMAGE_GUTTER / 2
  }
});

export default A;
