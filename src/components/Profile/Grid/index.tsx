import React from "react";
import {
  Animated,
  ListRenderItemInfo,
  StyleSheet,
  ViewStyle
} from "react-native";

import groupBy from "lodash/groupBy";
import moment from "moment";
import { PostType } from "unexpected-cloud/models/post";

import { Month, Months } from "./Month";

import testPosts from "./test_data";
import { ItemSeparator } from "@components/universal";

export interface GridProps {
  onScroll?: any;
  onPressPost: (item: PostType) => void;
  ListHeaderComponentStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any>;
  posts: PostType[];
}

export const Grid: React.FC<GridProps> = ({
  onPressPost,
  ListHeaderComponentStyle,
  ListHeaderComponent,
  onScroll,
  posts
}) => {
  // returns object mapping month (0, 1, 2, ...) to array of posts
  const generateMonths = (posts: PostType[]) => {
    const map = groupBy(posts, ({ createdAt }) =>
      moment(createdAt).startOf("month")
    );

    return Object.keys(map)
      .sort((a, b) => moment(b).diff(moment(a)))
      .map(month => ({
        month: Months[moment(month as any).get("month")],
        posts: map[month]
      }));
  };

  const renderMonth = ({
    item
  }: ListRenderItemInfo<{ month: Months; posts: PostType[] }>) => (
    <Month onPressPost={onPressPost} {...item} />
  );

  // const renderSeparatorComponent = () => <ItemSeparator />;

  const months = generateMonths(testPosts);

  return (
    <Animated.FlatList
      style={styles.list}
      onScroll={onScroll}
      showsVerticalScrollIndicator={false}
      ListHeaderComponentStyle={ListHeaderComponentStyle}
      ListHeaderComponent={ListHeaderComponent}
      // ItemSeparatorComponent={renderSeparatorComponent}
      renderItem={renderMonth}
      data={months}
    />
  );
};

const styles = StyleSheet.create({
  list: { height: "100%", width: "100%" }
});
