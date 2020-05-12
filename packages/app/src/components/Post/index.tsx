import React, { useCallback, useState, useContext } from "react";
import { View, StyleSheet, Text, ImageStyle, ViewStyle } from "react-native";
import Animated, { useCode, interpolate, Value } from "react-native-reanimated";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/core";
import { connect, ConnectedProps } from "react-redux";
import { useValue } from "react-native-redash";
import moment from "moment";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TextStyles,
  formatName,
  Colors,
} from "@lib";

import Image from "./Image";
import Comments from "./Comments";
import CommentsButton from "./CommentsButton";
import { StackParamList } from "App";
import { FocusedPostContext } from "@hooks";

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

    const navigateToProfile = useCallback((userId: string) => {
      unmount();
      navigation.navigate("PROFILE", {
        userId,
      });
    }, []);

    const handleOnPressName = useCallback(() => {
      navigateToProfile(userId);
    }, []);

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
