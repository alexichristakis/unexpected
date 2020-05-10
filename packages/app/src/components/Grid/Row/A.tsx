import React from "react";
import { StyleSheet, View } from "react-native";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib";

export interface AProps {
  renderPost: (id: string, size: number) => JSX.Element;
  posts: string[];
}

const A: React.FC<AProps> = ({ renderPost, posts }) => (
  <View style={styles.container}>
    {posts.map((post) => renderPost(post, COLUMN_WIDTH(1, posts.length)))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: IMAGE_GUTTER,
    marginVertical: IMAGE_GUTTER / 2,
  },
});

export default A;
