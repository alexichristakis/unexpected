import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FeedPostType, PostType } from "unexpected-cloud/models/post";

import { SCREEN_WIDTH, TextStyles } from "@lib/styles";
import PostImage from "./PostImage";
import { TouchableScale } from "./TouchableScale";
import Animated, { Easing } from "react-native-reanimated";

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

  const translateY = Animated.interpolate(entranceAnimatedValue, {
    inputRange: [0, 1],
    outputRange: [40 * (index + 1), 0]
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity: entranceAnimatedValue }
      ]}
    >
      <TouchableOpacity onPress={onPressName}>
        <Text style={[TextStyles.large, styles.name]}>
          {`${post.user.firstName} ${post.user.lastName}`}
        </Text>
      </TouchableOpacity>
      <TouchableScale onPress={onPressPhoto}>
        <PostImage
          width={SCREEN_WIDTH - 40}
          height={(SCREEN_WIDTH - 40) * 1.2}
          phoneNumber={userPhoneNumber}
          id={photoId}
        />
      </TouchableScale>
      <Text style={TextStyles.medium}>{description}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40
  },
  name: {
    marginBottom: 10
  }
});
