import React from "react";
import { StyleSheet, Text, View } from "react-native";
import uuid from "uuid/v4";
import { Post } from "@unexpected/global";

import { TextStyles } from "@lib/styles";

import { Row, RowType, RowTypes } from "./Row";

export enum Months {
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
}

export interface MonthProps {
  onPressPost: (item: Post) => void;
  showHeader: boolean;
  month: Months;
  posts: Post[];
}

export const Month: React.FC<MonthProps> = React.memo(
  ({ month, posts, showHeader, onPressPost }) => {
    const generateRows = (posts: Post[]) => {
      const rows: RowType[] = [];

      for (let index = 0; index < posts.length; ) {
        const remainingPosts = posts.length - index;

        let addedPosts = 0;
        if (remainingPosts <= 5) {
          rows.push({
            id: uuid(),
            type: RowTypes.B,
            posts: posts.slice(index)
          });

          addedPosts = remainingPosts;
        } else {
          const version = Math.floor(Math.random() * 3);
          const id = uuid();

          if (version === 0) {
            rows.push({
              id,
              type: RowTypes.A,
              posts: posts.slice(index, index + 4)
            });

            addedPosts = 4;
          } else if (version === 1) {
            rows.push({
              id,
              type: RowTypes.B,
              posts: posts.slice(index, index + 5)
            });

            addedPosts = 5;
          } else {
            rows.push({
              id,
              type: RowTypes.C,
              posts: posts.slice(index, index + 4)
            });

            addedPosts = 4;
          }
        }

        index += addedPosts;
      }

      return rows;
    };

    const momentsString = () =>
      `${posts.length} ${posts.length === 1 ? "moment" : "moments"}`;

    const rows = generateRows(posts);

    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.headerContainer}>
            <Text style={TextStyles.medium}>{month}</Text>
            <Text style={TextStyles.medium}>{momentsString()}</Text>
          </View>
        )}
        {rows.map(({ id, type, posts }) => (
          <Row key={id} onPressPost={onPressPost} type={type} posts={posts} />
        ))}
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.posts.length === nextProps.posts.length
);

const styles = StyleSheet.create({
  container: {
    width: "100%"
  },
  headerContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
