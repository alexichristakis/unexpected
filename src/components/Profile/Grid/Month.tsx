import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PostType } from "unexpected-cloud/models/post";

import { TextStyles } from "@lib/styles";

import uuid from "uuid/v4";
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
  onPressPost: (item: PostType) => void;
  month: Months;
  posts: PostType[];
}

export const Month: React.FC<MonthProps> = React.memo(
  ({ month, posts, onPressPost }) => {
    const generateRows = (posts: PostType[]) => {
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

    const rows = generateRows(posts);

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={TextStyles.large}>{month}</Text>
          <Text style={TextStyles.small}>{`${posts.length} moments`}</Text>
        </View>
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
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
