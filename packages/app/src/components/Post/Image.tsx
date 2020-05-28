import React from "react";
import { ImageStyle, StyleSheet, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, { interpolate } from "react-native-reanimated";
import { useGestureHandler, useValues } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import { useMemoOne } from "use-memo-one";

import { ZoomHandler } from "@components/universal";
import { SCREEN_WIDTH, withSpringImperative } from "@lib";
import { RootState, selectors } from "@redux";

const AnimatedImage = Animated.createAnimatedComponent(FastImage);

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

    return (
      <PanGestureHandler {...handler} activeOffsetX={[-10, 10]}>
        <Animated.View style={[styles.container, containerStyle]}>
          <ZoomHandler>
            <AnimatedImage
              source={src}
              style={[
                styles.image,
                style,
                {
                  transform: [{ scale }, ...(style?.transform ?? [])],
                },
              ]}
            />
          </ZoomHandler>
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
  },
  image: {
    backgroundColor: "white",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
});

export default connector(Image);
