import React from "react";
import { View, StyleSheet } from "react-native";

import { PostType } from "unexpected-cloud/models/post";
import { IMAGE_GUTTER, COLUMN_WIDTH } from "@lib/styles";

export interface BProps {
  renderPost: (post: PostType, size: number) => JSX.Element;
  posts: PostType[];
}

export const BSize = COLUMN_WIDTH;

const B: React.FC<BProps> = ({ renderPost, posts }) => {
  const renderPosts = () => {
    let elements: JSX.Element[] = [];
    for (let i = 0; i < 5; i++) {
      if (i <= posts.length - 1) {
        elements.push(renderPost(posts[i], BSize));
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
    width: BSize,
    height: BSize
  }
});

export default B;
