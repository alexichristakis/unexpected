import React, { useCallback, useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useCode,
  debug,
  Value,
  Clock,
  interpolate,
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SPRING_CONFIG } from "@lib";
import { TextStyles, Colors } from "@lib";

import Image from "./Image";
import Comments from "./Comments";
import { formatName } from "@lib";
import {
  useValues,
  useValue,
  useGestureHandler,
  withTransition,
  mix,
} from "react-native-redash";
import { TapGestureHandler, State } from "react-native-gesture-handler";

const {
  cond,
  onChange,
  set,
  and,
  clockRunning,
  not,
  neq,
  call,
  block,
  startClock,
  stopClock,
  spring,
  sub,
  add,
  eq,
  greaterThan,
} = Animated;

const connector = connect(
  (state: RootState, props: PostProps) => ({
    post: selectors.post(state, props),
  }),
  {}
);

export interface PostProps {
  id: string;
  dragStarted: Animated.Adaptable<0 | 1>;
  offset: Animated.Adaptable<number>;
}

export type PostConnectedProps = ConnectedProps<typeof connector>;

export const POST_HEIGHT = Math.round(0.65 * SCREEN_HEIGHT);

const Post: React.FC<PostProps & PostConnectedProps> = React.memo(
  ({ id, post, dragStarted, offset }) => {
    const state = useValue(State.UNDETERMINED);
    const [open] = useValues<0 | 1>([0]);

    const handler = useGestureHandler({ state });

    const scale = interpolate(offset, {
      inputRange: [-POST_HEIGHT, 0, POST_HEIGHT],
      outputRange: [0.92, 1, 0.92],
    });

    useCode(
      () => [
        onChange(dragStarted, cond(dragStarted, set(open, 0))),
        onChange(
          state,
          cond(eq(state, State.END), [
            cond(open, [set(open, 0)], [set(open, 1)]),
          ])
        ),
      ],
      []
    );

    const transition = withTransition(open);
    return (
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.header}>
          <Text style={TextStyles.large}>{post.description}</Text>
        </View>
        <Image {...{ open }}>
          {(translation) => <Comments postId={id} {...translation} />}
        </Image>
        <View style={styles.footer}>
          <View style={styles.row}>
            <View style={styles.profile} />
            <View>
              <Text style={TextStyles.medium}>{formatName(post.user)}</Text>
              <Text style={TextStyles.small}>2 minutes ago</Text>
            </View>
          </View>
          <TapGestureHandler {...handler}>
            <Animated.View style={styles.commentIndicator}>
              <Animated.Text
                style={{
                  position: "absolute",
                  opacity: mix(transition, 1, 0),
                  ...TextStyles.medium,
                }}
              >
                {post.comments.length}
              </Animated.Text>
              <Animated.Text
                style={{
                  position: "absolute",
                  opacity: transition,
                  ...TextStyles.large,
                }}
              >
                →
              </Animated.Text>
            </Animated.View>
          </TapGestureHandler>
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    justifyContent: "center",
    height: POST_HEIGHT,
    width: SCREEN_WIDTH - 40,
  },
  header: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    // marginHorizontal: 10,
  },
  commentIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightpink",
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "lightblue",
  },
});

export default connector(Post);
