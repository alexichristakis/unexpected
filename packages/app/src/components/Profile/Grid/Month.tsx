import React from "react";
import { StyleSheet, Text, View } from "react-native";
import uuid from "uuid/v4";
import random from "lodash/random";
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
        if (remainingPosts <= 3) {
          // single row of photos
          rows.push({
            id: uuid(),
            type: RowTypes.A,
            posts: posts.slice(index)
          });

          addedPosts = remainingPosts;
        } else {
          const version = random(Object.keys(RowTypes).length);
          const id = uuid();

          switch (version) {
            case RowTypes.A: {
              if (remainingPosts >= 5) {
                addedPosts = 5;

                rows.push({
                  id,
                  type: RowTypes.A,
                  posts: posts.slice(index, index + addedPosts)
                });
              }

              break;
            }

            case RowTypes.B: {
              addedPosts = 4;

              rows.push({
                id,
                type: RowTypes.B,
                posts: posts.slice(index, index + addedPosts)
              });

              break;
            }

            case RowTypes.C: {
              addedPosts = 4;

              rows.push({
                id,
                type: RowTypes.C,
                posts: posts.slice(index, index + addedPosts)
              });

              break;
            }

            case RowTypes.D: {
              if (remainingPosts >= 5) {
                addedPosts = 5;

                rows.push({
                  id,
                  type: RowTypes.D,
                  posts: posts.slice(index, index + addedPosts)
                });
              }

              break;
            }
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
