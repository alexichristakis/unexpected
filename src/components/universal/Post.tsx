import React from "react";
import { Text, View } from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { SCREEN_WIDTH, TextStyles } from "@lib/styles";
import PostImage from "./PostImage";

export interface PostProps {
  post: PostType;
}
export const Post: React.FC<PostProps> = ({ post }) => {
  const { userPhoneNumber, photoId, description } = post;

  return (
    <View>
      <Text style={TextStyles.large}>{"Alexi Christakis"}</Text>
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
