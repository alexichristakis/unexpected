import { useNavigation } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import moment from "moment";
import React, { useCallback, useContext, useState } from "react";
import { ImageStyle, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { interpolate, useCode, Value } from "react-native-reanimated";
import { useValue } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import {
  Colors,
  formatName,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TextStyles,
} from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import { FocusedPostContext } from "@hooks";
import { StackParamList } from "App";
import Comments from "./Comments";
import CommentsButton from "./CommentsButton";
import Image from "./Image";

const { cond, call, onChange, set } = Animated;

const connector = connect(
  (state: RootState, props: PostProps) => ({
    post: selectors.populatedPost(state, props),
    numComments: selectors.numComments(state, props),
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
  inViewbox?: Animated.Value<0 | 1> | Animated.Node<0 | 1>;
  focused?: Animated.Value<0 | 1> | Animated.Node<0 | 1>;
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
    numComments,
    light,
    post: { userId, user, description, createdAt },
    inViewbox = new Value(1),
    focused = new Value(1),
    dragStarted = 0,
    offset = 0,
    animate = { image: {}, header: {}, footer: {} },
  }) => {
    const navigation = useNavigation<StackNavigationProp<StackParamList>>();
    const { unmount } = useContext(FocusedPostContext);
    const [isVisible, setIsVisible] = useState(false);
    const open = useValue<0 | 1>(0);

    useCode(
      () => [
        onChange(
          inViewbox,
          call([inViewbox], ([inViewbox]) => setIsVisible(!!inViewbox))
        ),
        cond(open, [cond(dragStarted, set(open, 0))]),
      ],
      []
    );

    const navigateToProfile = useCallback((id: string) => {
      unmount();
      navigation.navigate("PROFILE", {
        id,
      });
    }, []);

    const handleOnPressName = useCallback(() => {
      navigateToProfile(userId);
    }, [userId]);

    if (isVisible) {
      const scale = interpolate(offset, {
        inputRange: [-POST_HEIGHT, 0, POST_HEIGHT],
        outputRange: [0.92, 1, 0.92],
      });

      const color = light ? Colors.lightGray : Colors.nearBlack;

      return (
        <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
          <Animated.Text style={{ ...styles.header, ...animate.header, color }}>
            {description}
          </Animated.Text>
          <Image
            style={animate.image}
            containerStyle={animate.container}
            {...{ open, id }}
          >
            {({ translateX }) => (
              <Comments
                postId={id}
                navigateToProfile={navigateToProfile}
                {...{ translateX, focused }}
              />
            )}
          </Image>
          <Animated.View style={{ ...styles.footer, ...animate.footer }}>
            <View style={styles.row}>
              <View style={styles.profile} />
              <View>
                <Text
                  onPress={handleOnPressName}
                  style={{
                    ...TextStyles.large,
                    textAlignVertical: "center",
                    color,
                  }}
                >
                  {formatName(user)}
                </Text>
                <Text
                  style={{
                    ...TextStyles.small,
                    textAlignVertical: "center",
                    color,
                  }}
                >
                  {moment(createdAt).fromNow()}
                </Text>
              </View>
            </View>
            <CommentsButton {...{ open, numComments }} />
          </Animated.View>
        </Animated.View>
      );
    }

    return <View style={styles.container} />;
  },
  (p, n) => p.id === n.id && p.numComments === n.numComments
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
    ...TextStyles.large,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
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
