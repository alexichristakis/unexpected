import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { SCREEN_WIDTH, TextStyles } from "@lib/styles";
import PostImage from "./PostImage";
import { StackParamList } from "../../App";
import { TouchableScale } from "./TouchableScale";

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
    <View style={{ marginBottom: 40 }}>
      <TouchableOpacity onPress={onPressName}>
        <Text style={[TextStyles.large, styles.name]}>
          {"Alexi Christakis"}
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
    </View>
  );
};

const styles = StyleSheet.create({
  name: {
    marginBottom: 10
  }
});
