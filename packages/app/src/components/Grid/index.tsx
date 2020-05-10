import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { Post } from "@unexpected/global";
import groupBy from "lodash/groupBy";
import moment from "moment";
import Animated from "react-native-reanimated";
import { onScrollEvent, vec } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import LockSVG from "@assets/svg/lock.svg";
import { Colors, TextStyles, SB_HEIGHT } from "@lib";

import { formatName } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import { Month, Months } from "./Month";
import { FocusedPostContext, FocusedPostPayload } from "@hooks";
import testPosts from "./test_data";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const mapStateToProps = (state: RootState, props: GridProps) => ({
  posts: selectors.posts(state, props),
});

const mapDispatchToProps = {};

export type GridConnectedProps = ConnectedProps<typeof connector>;

export interface GridProps {
  renderHeader: () => JSX.Element;
  uid: string;
}

type MonthsData = {
  id: string;
  month: string;
  posts: Post[];
}[];

export const Grid: React.FC<GridProps & GridConnectedProps> = React.memo(
  ({ posts, renderHeader }) => {
    const { setId, origin, size, open } = useContext(FocusedPostContext);

    const handleOnPressPost = useCallback((payload: FocusedPostPayload) => {
      origin.x.setValue(payload.origin.x);
      origin.y.setValue(payload.origin.y);
      size.setValue(payload.size);

      setId(payload.id);
      open();
    }, []);

    // returns object mapping month (0, 1, 2, ...) to array of posts
    const generateSections = useCallback((posts: Post[]) => {
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
    }, []);

    const renderSection = ({
      item,
      index,
    }: {
      index: number;
      item: {
        id: string;
        month: string;
        posts: string[];
      };
    }) => <Month key={item.id} onPressPost={handleOnPressPost} {...item} />;

    return useMemo(() => {
      const sections = generateSections(testPosts);

      return (
        <FlatList
          style={styles.list}
          data={sections}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderSection}
          removeClippedSubviews={true}
          ListHeaderComponent={renderHeader}
        />
      );
    }, []);
  }
);

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: "100%",
    paddingTop: SB_HEIGHT,
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
