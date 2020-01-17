import React from "react";
import { StyleSheet, View } from "react-native";

import { Post } from "@unexpected/global";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib/styles";

export interface AProps {
  renderPost: (post: Post, size: number) => JSX.Element;
  posts: Post[];
}

export const ASize = COLUMN_WIDTH;

const A: React.FC<AProps> = ({ renderPost, posts }) => {
  const renderPosts = () => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < 5; i++) {
      if (i <= posts.length - 1) {
        elements.push(renderPost(posts[i], ASize));
      } else {
        elements.push(<View key={i} style={styles.filler} />);
      }
    }

    return elements;
  };

  return <View style={styles.container}>{renderPosts()}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: IMAGE_GUTTER,
    marginVertical: IMAGE_GUTTER / 2
  },
  filler: {
    width: ASize,
    height: ASize
  }
});

export default A;
