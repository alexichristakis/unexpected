import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ScrollViewProps
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
import { ConnectedProps, connect } from "react-redux";

import LockSVG from "@assets/svg/lock.svg";
import { Colors, TextStyles } from "@lib/styles";

import { formatName } from "@lib/utils";
import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";

// import testPosts from "./test_data";
import { Month, Months } from "./Month";

const mapStateToProps = (state: RootState, props: GridProps) => ({
  isUser: !props.phoneNumber,
  loading: selectors.postLoading(state),
  user: selectors.user(state, props),
  posts: selectors.usersPosts(state, props)
});

const mapDispatchToProps = {};

export type GridConnectedProps = ConnectedProps<typeof connector>;

export interface GridProps {
  scrollY?: Animated.Value<number>;
  friendStatus?: "friends" | "notFriends" | "unknown";
  phoneNumber?: string;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onPressPost: (item: Post) => void;
  headerContainerStyle?: ViewStyle;
  renderHeader?: React.ComponentType<any>;
}

export const Grid: React.FC<GridProps & GridConnectedProps> = React.memo(
  ({
    isUser,
    friendStatus = "friends",
    loading,
    onPressPost,
    headerContainerStyle,
    renderHeader,
    onScrollEndDrag,
    scrollY,
    user,
    posts
  }) => {
    const [releasedPosts, setReleasedPosts] = useState<Post[]>(posts);
    const gridTransitionRef = useRef<TransitioningView>();

    useLayoutEffect(() => {
      gridTransitionRef.current?.animateNextTransition();
      setReleasedPosts(posts);
    }, [loading, posts.length, gridTransitionRef]);

    // returns object mapping month (0, 1, 2, ...) to array of posts
    const generateMonths = (posts: Post[]) => {
      if (friendStatus !== "friends") return [];

      const map = groupBy(posts, ({ createdAt }) =>
        moment(createdAt).startOf("month")
      );

      return Object.keys(map)
        .sort((a, b) => moment(b).diff(moment(a)))
        .map(month => ({
          id: month,
          month: Months[moment(month, "ddd MMM DD YYYY").get("month")],
          posts: map[month].sort((a, b) =>
            moment(b.createdAt).diff(moment(a.createdAt))
          )
        }));
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

    const transition = (
      <Transition.Together>
        <Transition.In type="fade" />
        <Transition.Out type="fade" />
        <Transition.Change interpolation="easeInOut" />
      </Transition.Together>
    );

    const renderScrollComponent = (props: ScrollViewProps) => (
      <Animated.ScrollView
        {...props}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll({ y: scrollY })}
      />
    );

    return (
      <Transitioning.View
        style={styles.list}
        ref={gridTransitionRef as any}
        transition={transition}
      >
        <FlatList
          style={styles.list}
          removeClippedSubviews={true}
          ListHeaderComponentStyle={headerContainerStyle}
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={renderSeparatorComponent}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={!isUser ? styles.contentContainer : {}}
          renderItem={renderMonth}
          data={generateMonths(releasedPosts) as any}
          onScrollEndDrag={onScrollEndDrag}
          renderScrollComponent={renderScrollComponent}
        />
      </Transitioning.View>
    );
  },
  (prevProps, nextProps) => prevProps.loading === nextProps.loading
);

const styles = StyleSheet.create({
  list: {
    height: "100%",
    width: "100%"
  },
  contentContainer: {
    paddingBottom: 100
  },
  separator: {
    alignSelf: "stretch",
    marginVertical: 10,
    marginHorizontal: 40,
    height: 1
    // backgroundColor: Colors.lightGray
  },
  emptyStateContainer: {
    alignItems: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Grid);
