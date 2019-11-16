import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { SCREEN_WIDTH, TextStyles } from "@lib/styles";
import PostImage from "./PostImage";
import { StackParamList } from "../../App";

export interface PostProps {
  onPressPhoto?: () => void;
  onPressName?: () => void;
  post: PostType;
}
export const Post: React.FC<PostProps> = ({
  post,
  onPressName,
  onPressPhoto
}) => {
  const { userPhoneNumber, photoId, description } = post;

  return (
    <View>
      <TouchableOpacity onPress={onPressName}>
        <Text style={TextStyles.large}>{"Alexi Christakis"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressPhoto}>
        <PostImage
          width={SCREEN_WIDTH - 40}
          height={(SCREEN_WIDTH - 40) * 1.2}
          phoneNumber={userPhoneNumber}
          id={photoId}
        />
      </TouchableOpacity>
      <Text style={TextStyles.medium}>{description}</Text>
    </View>
  );
};
