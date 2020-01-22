import React, { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import moment from "moment";
import Animated from "react-native-reanimated";

import { FEED_POST_WIDTH } from "@lib/constants";
import { Colors, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { FeedPost } from "@unexpected/global";

import Comments from "./Comments";

export interface PostProps {
  entranceAnimatedValue?: Animated.Value<number>;
  index?: number;
  post: FeedPost;
  renderImage: () => JSX.Element;
  onPressName?: () => void;
}

export type PostRef = {
  setVisible: () => void;
  setNotVisible: () => void;
};

export const Post = React.memo(
  forwardRef<PostRef, PostProps>(({ post, onPressName, renderImage }, ref) => {
    // const [visible, setVisible] = useState(false);
    const { description, user, createdAt, comments } = post;

    useImperativeHandle(ref, () => ({
      setVisible: () => console.log("visible"),
      setNotVisible: () => console.log("not visible")
    }));

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onPressName}>
            <Text style={[TextStyles.large, styles.name]}>
              {formatName(user)}
            </Text>
          </TouchableOpacity>
          <Text style={TextStyles.small}>{moment(createdAt).fromNow()}</Text>
        </View>
        {renderImage()}
        <Text style={styles.description}>{description}</Text>
        <Comments comments={comments} />
      </View>
    );
  }),
  (prevProps, nextProps) =>
    moment(prevProps.post.createdAt).fromNow() ===
    moment(nextProps.post.createdAt).fromNow()
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 40
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },
  name: {
    marginBottom: 10
  },
  description: {
    ...TextStyles.medium,
    marginTop: 10,
    paddingHorizontal: 20
  }
});
