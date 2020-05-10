import React from "react";
import { View, StyleSheet, Text, ImageStyle, ViewStyle } from "react-native";
import Animated, { useCode, interpolate } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import {
  useValues,
  useValue,
  useGestureHandler,
  withTransition,
  mix,
} from "react-native-redash";
import { TapGestureHandler, State } from "react-native-gesture-handler";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TextStyles,
  formatName,
  Colors,
} from "@lib";

import { getPostImageURL } from "@api";

import Image from "./Image";
import Comments from "./Comments";
import CommentsButton from "./CommentsButton";

const { cond, onChange, set } = Animated;

const connector = connect(
  (state: RootState, props: PostProps) => ({
    post: selectors.post(state, props),
  }),
  {}
);

export type AnimateProp = {
  header: Animated.AnimateStyle<ViewStyle>;
  image: Animated.AnimateStyle<ImageStyle>;
  container: Animated.AnimateStyle<ViewStyle>;
  footer: Animated.AnimateStyle<ViewStyle>;
};

export interface PostProps {
  id: string;
  visible?: Animated.Adaptable<0 | 1>;
  light?: boolean;
  dragStarted?: Animated.Adaptable<0 | 1>;
  offset?: Animated.Adaptable<number>;
  animate?: AnimateProp;
}

export type PostConnectedProps = ConnectedProps<typeof connector>;

export const POST_HEIGHT = Math.round(0.65 * SCREEN_HEIGHT);

const Post: React.FC<PostProps & PostConnectedProps> = React.memo(
  ({
    id,
    post,
    light,
    visible = 1,
    dragStarted = 0,
    offset = 0,
    animate = { image: {}, header: {}, footer: {} },
  }) => {
    const [open] = useValues<0 | 1>([0]);

    const scale = interpolate(offset, {
      inputRange: [-POST_HEIGHT, 0, POST_HEIGHT],
      outputRange: [0.92, 1, 0.92],
    });

    useCode(() => cond(open, [cond(dragStarted, set(open, 0))]), []);

    const color = light ? Colors.lightGray : Colors.nearBlack;
    return (
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        <Animated.View style={{ ...styles.header, ...animate.header }}>
          <Text style={{ ...TextStyles.large, color }}>{post.description}</Text>
        </Animated.View>
        <Image
          style={animate.image}
          containerStyle={animate.container}
          src={getPostImageURL("post.user", post.photoId)}
          {...{ open }}
        >
          {({ translateX }) => (
            <Comments postId={id} {...{ translateX, visible }} />
          )}
        </Image>
        <Animated.View style={{ ...styles.footer, ...animate.footer }}>
          <View style={styles.row}>
            <View style={styles.profile} />
            <View>
              <Text style={{ ...TextStyles.medium, color }}>
                {formatName(post.user)}
              </Text>
              <Text style={{ ...TextStyles.small, color }}>2 minutes ago</Text>
            </View>
          </View>
          <CommentsButton {...{ open, numComments: post.comments.length }} />
        </Animated.View>
      </Animated.View>
    );
  }
  // (p, n) => p.id === n.id
);

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    justifyContent: "center",
    height: POST_HEIGHT,
    width: SCREEN_WIDTH - 40,
    // backgroundColor: "rgba(100,100,100,0.5)",
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
