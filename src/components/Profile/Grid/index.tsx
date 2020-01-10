import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";

import groupBy from "lodash/groupBy";
import moment from "moment";
import Animated, {
  Transitioning,
  TransitioningView,
  Transition
} from "react-native-reanimated";
import { PostType } from "unexpected-cloud/models/post";

import LockSVG from "@assets/svg/lock.svg";
import { Colors, TextStyles } from "@lib/styles";

import { formatName } from "@lib/utils";
import { UserType } from "unexpected-cloud/models/user";
import { Month, Months } from "./Month";
import testPosts from "./test_data";
import { onScroll } from "react-native-redash";

export interface GridProps {
  transitionRef?: React.Ref<TransitioningView>;
  scrollY?: Animated.Value<number>;
  user?: UserType;
  friendStatus?: "friends" | "notFriends" | "unknown";
  loading: boolean;
  onPressPost: (item: PostType) => void;
  ListHeaderComponentStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any>;
  posts: PostType[];
}

export const Grid: React.FC<GridProps> = ({
  friendStatus = "friends",
  transitionRef,
  loading,
  onPressPost,
  ListHeaderComponentStyle,
  ListHeaderComponent,
  scrollY,
  user,
  posts
}) => {
  // returns object mapping month (0, 1, 2, ...) to array of posts
  const generateMonths = (posts: PostType[]) => {
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

  const months = generateMonths(posts);

  const renderMonth = ({
    item,
    index
  }: ListRenderItemInfo<{
    id: string;
    month: Months;
    posts: PostType[];
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
          <Text style={[TextStyles.large, { marginTop: 20, marginBottom: 10 }]}>
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

  return (
    <Transitioning.View
      style={styles.list}
      ref={transitionRef}
      transition={transition}
    >
      <FlatList
        style={styles.list}
        ListHeaderComponentStyle={ListHeaderComponentStyle}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={renderSeparatorComponent}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={renderMonth}
        data={months as any}
        renderScrollComponent={props => (
          <Animated.ScrollView
            {...props}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll({ y: scrollY })}
          />
        )}
      />
    </Transitioning.View>
  );
};

const styles = StyleSheet.create({
  list: {
    height: "100%",
    width: "100%"
  },
  separator: {
    alignSelf: "stretch",
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 40,
    height: 1,
    backgroundColor: Colors.lightGray
  },
  emptyStateContainer: {
    alignItems: "center"
  }
});
