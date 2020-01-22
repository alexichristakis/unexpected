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

export const Post: React.FC<PostProps> = React.memo(
  ({
    entranceAnimatedValue = 1,
    index = 0,
    post,
    onPressName,
    renderImage
  }) => {
    // const [visible, setVisible] = useState(false);
    const { description, user, createdAt, comments = [] } = post;

    // useImperativeHandle(ref, () => ({
    //   setVisible: () => setVisible(true),
    //   setNotVisible: () => setVisible(false)
    // }));

    const animatedContainer = {
      transform: [
        {
          translateY: Animated.interpolate(entranceAnimatedValue, {
            inputRange: [0, 1],
            outputRange: [150 * (index + 1), 0]
          })
        }
      ],
      opacity: entranceAnimatedValue
    };

    return (
      <Animated.View style={[styles.container, animatedContainer]}>
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
      </Animated.View>
    );
  },
  (prevProps, nextProps) =>
    moment(prevProps.post.createdAt).fromNow() ===
    moment(nextProps.post.createdAt).fromNow()
);

// export const Post = forwardRef<
//   { setVisible: () => void; setNotVisible: () => void },
//   PostProps
// >(_Post);

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
