import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import moment from "moment";
import Animated from "react-native-reanimated";
import { FeedPostType, PostType } from "unexpected-cloud/models/post";

import { SCREEN_WIDTH, TextStyles } from "@lib/styles";
import PostImage from "./PostImage";
import { TouchableScale } from "./TouchableScale";

export interface PostProps {
  entranceAnimatedValue?: Animated.Value<number>;
  index?: number;
  post: FeedPostType;
  onPressPhoto?: () => void;
  onPressName?: () => void;
}
export const Post: React.FC<PostProps> = ({
  entranceAnimatedValue = 1,
  index = 0,
  post,
  onPressName,
  onPressPhoto
}) => {
  const { userPhoneNumber, photoId, description } = post;

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
      <View style={styles.row}>
        <TouchableOpacity onPress={onPressName}>
          <Text style={[TextStyles.large, styles.name]}>
            {`${post.user.firstName} ${post.user.lastName}`}
          </Text>
        </TouchableOpacity>
        <Text style={TextStyles.small}>{moment(post.createdAt).fromNow()}</Text>
      </View>
      <TouchableScale onPress={onPressPhoto}>
        <PostImage
          width={SCREEN_WIDTH - 40}
          height={(SCREEN_WIDTH - 40) * 1.2}
          phoneNumber={userPhoneNumber}
          id={photoId}
        />
      </TouchableScale>
      <Text style={styles.description}>{description}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  name: {
    marginBottom: 10
  },
  description: {
    ...TextStyles.medium,
    marginTop: 10
  }
});
