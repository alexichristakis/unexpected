import React from "react";
import { StyleSheet, View } from "react-native";

import { Post } from "@unexpected/global";

import { COLUMN_WIDTH, IMAGE_GUTTER } from "@lib";
import random from "lodash/random";

export interface BProps {
  renderPost: (id: string, size: number) => JSX.Element;
  posts: string[];
}

export const BSizes = {
  large: COLUMN_WIDTH(2),
  small: COLUMN_WIDTH(1),
};

const B: React.FC<BProps> = ({ renderPost, posts }) => {
  const version = Math.random();

  if (version < 0.5) {
    return (
      <View style={styles.container}>
        {renderPost(posts[0], BSizes.large)}
        <View style={styles.square}>
          {renderPost(posts[1], BSizes.small)}
          {renderPost(posts[2], BSizes.small)}
          {renderPost(posts[3], BSizes.small)}
          {renderPost(posts[4], BSizes.small)}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.square}>
        {renderPost(posts[1], BSizes.small)}
        {renderPost(posts[2], BSizes.small)}
        {renderPost(posts[3], BSizes.small)}
        {renderPost(posts[4], BSizes.small)}
      </View>
      {renderPost(posts[0], BSizes.large)}
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
  square: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
    width: BSizes.large,
    height: BSizes.large,
  },
});

export default B;
