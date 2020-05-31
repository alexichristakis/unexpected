import React, { useCallback, useContext, useMemo } from "react";
import { FlatList, StyleSheet, StyleProp, ViewStyle } from "react-native";

import groupBy from "lodash/groupBy";
import moment from "moment";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { onScrollEvent } from "react-native-redash";

import LockSVG from "@assets/svg/lock.svg";
import { Colors, SB_HEIGHT, TextStyles } from "@lib";
import { FocusedPostContext, FocusedPostPayload } from "@hooks";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import { Month, Months } from "./Month";
import testPosts from "./test_data";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const mapStateToProps = (state: RootState, props: GridProps) => ({
  posts: selectors.usersPosts(state, props),
});

const mapDispatchToProps = {};

export type GridConnectedProps = ConnectedProps<typeof connector>;

export interface GridProps {
  userId: string;
  style?: StyleProp<ViewStyle>;
  offset?: Animated.Value<number>;
  renderHeader: () => JSX.Element;
}

export const Grid: React.FC<GridProps & GridConnectedProps> = React.memo(
  ({ posts, style, offset, renderHeader }) => {
    console.log("posts", posts);

    const { setId, origin, size, open } = useContext(FocusedPostContext);

    const handleOnPressPost = useCallback((payload: FocusedPostPayload) => {
      origin.x.setValue(payload.origin.x);
      origin.y.setValue(payload.origin.y);
      size.setValue(payload.size);

      setId(payload.id);
      open();
    }, []);

    // returns object mapping month (0, 1, 2, ...) to array of posts
    const generateSections = useCallback(
      (posts: { id: string; createdAt: Date }[]) => {
        const map = groupBy(posts, ({ createdAt }) =>
          moment(createdAt).startOf("month")
        );

        return Object.keys(map)
          .sort((a, b) => moment(b).diff(moment(a)))
          .map((month) => ({
            id: month,
            month: Months[moment(month, "ddd MMM DD YYYY").get("month")],
            posts: map[month]
              .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)))
              .map(({ id }) => id),
          }));
      },
      []
    );

    const renderSection = ({
      item,
    }: {
      index: number;
      item: {
        id: string;
        month: string;
        posts: string[];
      };
    }) => <Month key={item.id} onPressPost={handleOnPressPost} {...item} />;

    return useMemo(() => {
      const sections = generateSections(posts);

      return (
        <FlatList
          style={[styles.list, style]}
          data={sections}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderSection}
          removeClippedSubviews={true}
          ListHeaderComponent={renderHeader}
          renderScrollComponent={(props) => (
            <Animated.ScrollView
              {...props}
              scrollEventThrottle={16}
              onScroll={onScrollEvent({ y: offset })}
            />
          )}
        />
      );
    }, [posts.length]);
  }
);

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background,
  },
  separator: {
    alignSelf: "stretch",
    marginVertical: 10,
    marginHorizontal: 40,
    height: 1,
  },
  emptyStateContainer: {
    alignItems: "center",
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Grid);
