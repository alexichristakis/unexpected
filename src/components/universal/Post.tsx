import React from "react";
import { View, Text } from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { PostImage } from "./PostImage";
import { SCREEN_WIDTH, TextStyles } from "@lib/styles";

export interface PostProps {
  post: PostType;
}
export const Post: React.FC<PostProps> = ({ post }) => {
  const { userPhoneNumber, photoId, description } = post;

  return (
    <View>
      <PostImage
        width={SCREEN_WIDTH - 40}
        height={(SCREEN_WIDTH - 40) * 1.2}
        phoneNumber={userPhoneNumber}
        id={photoId}
      />
      <Text style={TextStyles.medium}>{description}</Text>
    </View>
  );
};
