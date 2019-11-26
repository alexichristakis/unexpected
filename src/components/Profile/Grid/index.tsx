import React from "react";
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  ViewStyle,
  StyleSheet
} from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { PostImage, TouchableScale } from "@components/universal";
import { SCREEN_WIDTH } from "@lib/styles";
import { StackParamList } from "../../../App";

export interface GridProps {
  onScroll?: any;
  onPressPost: (item: PostType) => void;
  ListHeaderComponentStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any>;
  posts: PostType[];
}

const Grid: React.FC<GridProps> = ({
  onPressPost,
  ListHeaderComponentStyle,
  ListHeaderComponent,
  onScroll,
  posts
}) => {
  const renderPost = ({ item }: ListRenderItemInfo<PostType>) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPressPost(item)}>
      <PostImage
        width={(SCREEN_WIDTH - 40) / 3}
        height={(SCREEN_WIDTH - 40) / 3}
        phoneNumber={item.userPhoneNumber}
        id={item.photoId}
      />
    </TouchableOpacity>
  );

  return (
    <Animated.FlatList
      style={styles.list}
      onScroll={onScroll}
      ListHeaderComponentStyle={ListHeaderComponentStyle}
      ListHeaderComponent={ListHeaderComponent}
      numColumns={3}
      renderItem={renderPost}
      data={posts}
    />
  );
};

const styles = StyleSheet.create({
  list: { height: "100%", width: "100%" }
});

export { Grid };
