import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, { Clock, Value } from "react-native-reanimated";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  snapPoint,
  useGestureHandler,
  useValue,
  useValues,
} from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import { useMemoOne } from "use-memo-one";

import Post, { POST_HEIGHT } from "@components/Post";
import { Colors, SPRING_CONFIG, withSnappingScroll } from "@lib";
import { PostActions, RootState, selectors } from "@redux";

import { StackParamList } from "App";
import Header from "./Header";

const {
  onChange,
  cond,
  abs,
  modulo,
  divide,
  lessThan,
  round,
  multiply,
  set,
  and,
  clockRunning,
  not,
  neq,
  block,
  startClock,
  stopClock,
  spring,
  sub,
  add,
  eq,
} = Animated;

const connector = connect(
  (state: RootState) => ({ postIds: selectors.feed(state) }),
  { fetchFeed: PostActions.fetchFeed }
);

export interface FeedProps {
  navigation: StackNavigationProp<StackParamList>;
}

export type FeedConnectedProps = ConnectedProps<typeof connector>;

const Feed: React.FC<FeedProps & FeedConnectedProps> = ({
  navigation,
  postIds,
  fetchFeed,
}) => {
  const state = useValue(State.UNDETERMINED);
  const [value, velocity, index] = useValues<number>(0, 0, 0);

  useEffect(() => {
    fetchFeed();
  }, []);

  const handler = useGestureHandler({
    state,
    translationY: value,
    velocityY: velocity,
  });

  const translateY = useMemoOne(
    () =>
      withSnappingScroll({
        value,
        state,
        index,
        velocity,
        itemHeight: POST_HEIGHT,
        length: postIds.length,
      }),
    []
  );

  const contentContainerStyle = {
    height: postIds.length * POST_HEIGHT,
    transform: [{ translateY }],
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler activeOffsetY={[-10, 10]} {...handler}>
        <Animated.View style={contentContainerStyle}>
          {postIds.map((id, key) => (
            <Post
              inViewbox={lessThan(abs(sub(key, index)), 3)}
              focused={eq(index, key)}
              dragStarted={eq(state, State.BEGAN)}
              offset={sub(translateY, key * -POST_HEIGHT)}
              {...{ id, key }}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>
      <Header navigation={navigation} offset={translateY} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: Colors.background,
    paddingTop: 150,
  },
});

export default connector(Feed);
