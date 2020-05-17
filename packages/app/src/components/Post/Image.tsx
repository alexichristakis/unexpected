import random from "lodash/random";
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ImageStyle,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import FastImage from "react-native-fast-image";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, { interpolate } from "react-native-reanimated";
import { useGestureHandler, useValues } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import { useMemoOne } from "use-memo-one";

import { SCREEN_HEIGHT, SCREEN_WIDTH, SPRING_CONFIG } from "@lib";
import { withSpringImperative } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Comments from "./Comments";

const AnimatedImage = Animated.createAnimatedComponent(FastImage);

const {
  cond,
  or,
  set,
  and,
  clockRunning,
  not,
  multiply,
  spring,
  neq,
  call,
  block,
  startClock,
  stopClock,
  sub,
  add,
  eq,
  greaterThan,
} = Animated;

const randomColor = () =>
  `rgba(${random(255)}, ${random(255)}, ${random(255)}, 1)`;

const connector = connect(
  (state: RootState, props: ImageProps) => ({
    src: selectors.postImageURL(state, props),
  }),
  {}
);

export interface ImageProps {
  id: string;
  open: Animated.Value<0 | 1>;
  style?: Animated.AnimateStyle<ImageStyle>;
  containerStyle?: Animated.AnimateStyle<ViewStyle>;
  children: ({
    translateX,
  }: {
    translateX: Animated.Node<number>;
  }) => JSX.Element;
}

export type PostImageConnectedProps = ConnectedProps<typeof connector>;

const Image: React.FC<ImageProps & PostImageConnectedProps> = React.memo(
  ({ children, style, containerStyle, src, open }) => {
    const [state, value, velocity] = useValues(State.UNDETERMINED, 0, 0);

    const handler = useGestureHandler({
      state,
      translationX: value,
      velocityX: velocity,
    });

    const translateX = useMemoOne(
      () =>
        withSpringImperative({
          value,
          velocity,
          state,
          open,
          snapPoints: [0, -SCREEN_WIDTH],
          openOffset: -SCREEN_WIDTH,
          closedOffset: 0,
        }),
      []
    );

    const scale = interpolate(translateX, {
      inputRange: [-SCREEN_WIDTH, 0],
      outputRange: [0.9, 1],
    });

    console.log(src);

    return (
      <PanGestureHandler {...handler} activeOffsetX={[-10, 10]}>
        <Animated.View style={{ ...styles.container, ...containerStyle }}>
          <AnimatedImage
            source={src}
            style={[
              styles.image,
              {
                ...style,
                transform: [{ scale }, ...(style?.transform ?? [])],
              },
            ]}
          />
          {children({ translateX })}
        </Animated.View>
      </PanGestureHandler>
    );
  },
  (p, n) => p.id === n.id
);

const styles = StyleSheet.create({
  container: {
    height: 450,
    zIndex: 1,
    width: "100%",
    flexDirection: "row",
    alignSelf: "center",
    // backgroundColor: "red",
    // justifyContent: "center",
  },
  image: {
    // backgroundColor: randomColor(),
    backgroundColor: "white",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
    // height: 450,
  },
});

export default connector(Image);
