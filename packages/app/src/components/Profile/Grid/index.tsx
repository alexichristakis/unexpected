import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";

import { Post, User } from "@unexpected/global";
import groupBy from "lodash/groupBy";
import moment from "moment";
import Animated, {
  Transition,
  Transitioning,
  TransitioningView
} from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import LockSVG from "@assets/svg/lock.svg";
import { Colors, TextStyles } from "@lib/styles";

import { formatName } from "@lib/utils";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import testPosts from "./test_data";
import { Month, Months } from "./Month";
import { Top } from "../Top";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const mapStateToProps = (state: RootState, props: GridProps) => ({
  loading: selectors.postLoading(state),
  user: selectors.user(state, props),
  posts: selectors.usersPosts(state, props)
});

const mapDispatchToProps = {};

export type GridConnectedProps = ConnectedProps<typeof connector>;

export interface GridProps {
  scrollRef?: React.Ref<Animated.ScrollView>;
  scrollY: Animated.Value<number>;
  friendStatus?: "friends" | "notFriends" | "unknown";
  phoneNumber?: string;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onPressPost: (item: Post) => void;
  headerContainerStyle?: ViewStyle;
  renderHeader?: () => JSX.Element;
}

export const Grid: React.FC<GridProps & GridConnectedProps> = React.memo(
  ({
    phoneNumber,
    scrollRef,
    scrollY,
    friendStatus = "friends",
    loading,
    onPressPost,
    headerContainerStyle,
    renderHeader,
    onScrollEndDrag,
    user,
    posts
  }) => {
    const [months, setMonths] = useState<
      {
        id: string;
        month: string;
        posts: Post[];
      }[]
    >([]);

    useEffect(() => {
      generateMonths(posts).then(ret => {
        setMonths(ret);
      });
    }, [posts.length]);

    // returns object mapping month (0, 1, 2, ...) to array of posts
    const generateMonths = (posts: Post[]) => {
      if (friendStatus !== "friends") return Promise.resolve([]);

      const map = groupBy(posts, ({ createdAt }) =>
        moment(createdAt).startOf("month")
      );

      const ret = Object.keys(map)
        .sort((a, b) => moment(b).diff(moment(a)))
        .map(month => ({
          id: month,
          month: Months[moment(month, "ddd MMM DD YYYY").get("month")],
          posts: map[month].sort((a, b) =>
            moment(b.createdAt).diff(moment(a.createdAt))
          )
        }));

      return Promise.resolve(ret);
    };

    const renderMonth = ({
      item,
      index
    }: ListRenderItemInfo<{
      id: string;
      month: Months;
      posts: Post[];
    }>) => (
      <Month
        showHeader={index > 0}
        key={item.id}
        onPressPost={onPressPost}
        {...item}
      />
    );

    const renderSeparatorComponent = () => <View style={styles.separator} />;

    const renderEmptyComponent = () => {
      if (friendStatus === "notFriends" && user)
        return (
          <View style={styles.emptyStateContainer}>
            <LockSVG width={100} height={100} />
            <Text
              style={[TextStyles.large, { marginTop: 20, marginBottom: 10 }]}
            >
              This user is private.
            </Text>
            <Text
              style={TextStyles.medium}
            >{`Friend ${user.firstName} to see their posts.`}</Text>
          </View>
        );

      if (loading)
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={TextStyles.large}>Loading posts...</Text>
          </View>
        );

      return (
        <View style={styles.emptyStateContainer}>
          <Text style={TextStyles.medium}>{`${formatName(
            user
          )} doesn't have any moments yet`}</Text>
        </View>
      );
    };

    return (
      <FlatList
        style={styles.list}
        ListHeaderComponentStyle={headerContainerStyle}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={renderSeparatorComponent}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={renderMonth}
        data={months as any}
        removeClippedSubviews={true}
        renderScrollComponent={props => (
          <Animated.ScrollView
            {...props}
            ref={scrollRef}
            horizontal={false}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll({ y: scrollY })}
            onScrollEndDrag={onScrollEndDrag}
          />
        )}
      />
    );

    // return (
    //   <AnimatedFlatList
    //     ref={scrollRef}
    //     style={styles.list}
    //     removeClippedSubviews={true}
    //     scrollEventThrottle={16}
    //     showsVerticalScrollIndicator={false}
    //     onScroll={onScroll({ y: scrollY })}
    //     ListHeaderComponentStyle={headerContainerStyle}
    //     ListHeaderComponent={renderHeader}
    //     ItemSeparatorComponent={renderSeparatorComponent}
    //     ListEmptyComponent={renderEmptyComponent}
    //     renderItem={renderMonth}
    //     data={months as any}
    //     onScrollEndDrag={onScrollEndDrag}
    //   />
    // );
  },
  (prevProps, nextProps) =>
    prevProps.loading === nextProps.loading &&
    prevProps.friendStatus === nextProps.friendStatus
);

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: "100%"
  },
  separator: {
    alignSelf: "stretch",
    marginVertical: 10,
    marginHorizontal: 40,
    height: 1
  },
  emptyStateContainer: {
    alignItems: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Grid);
