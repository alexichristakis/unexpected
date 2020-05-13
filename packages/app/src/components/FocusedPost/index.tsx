import React, { useContext, useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  proc,
  Value,
} from "react-native-reanimated";
import { bin, mix, translate } from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import Post, { AnimateProp } from "@components/Post";
import { FocusedPostContext } from "@hooks";
import { Colors, SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib";

const {
  onChange,
  cond,
  abs,
  modulo,
  divide,
  round,
  multiply,
  set,
  or,
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
  lessThan,
  greaterThan,
} = Animated;

export interface FocusedPostProps {}

const FocusedPost: React.FC<FocusedPostProps> = React.memo(({}) => {
  const {
    id,
    close,
    origin,
    size,
    isOpenValue,
    runUnmount,
    transition,
    isOpen,
  } = useContext(FocusedPostContext);

  // fetch new post data on each load
  // useEffect(() => [fetchPost(id)], [id]);

  const animate: AnimateProp = useMemoOne(() => {
    const opacity = interpolate(transition, {
      inputRange: [0.66, 1],
      outputRange: [0, 1],
      extrapolate: Extrapolate.CLAMP,
    });

    const headerTranslateY = cond(runUnmount, -215, mix(transition, 0, -215));
    const footerTranslateY = cond(runUnmount, 245, mix(transition, 0, 245));

    const s = proc((node: Animated.Node<number>) => cond(runUnmount, 0, node));
    const imageTranslate = {
      x: s(mix(transition, add(size, origin.x, -SCREEN_WIDTH / 2), 0)),
      y: s(mix(transition, add(size, origin.y, -SCREEN_HEIGHT / 2), 0)),
    };

    const imageViewbox = {
      left: s(mix(transition, sub((SCREEN_WIDTH - 40) / 2, size), 0)),
      right: s(mix(transition, sub((SCREEN_WIDTH - 40) / 2, size), 0)),
      top: s(mix(transition, sub(225, size), 0)),
      bottom: s(mix(transition, sub(225, size), 0)),
    };

    return {
      header: {
        transform: [{ translateY: headerTranslateY }],
        opacity,
      },
      image: {
        backgroundColor: Colors.background,
        borderRadius: mix(transition, 5, 20),
        transform: translate(imageTranslate),
        ...imageViewbox,
      },
      container: {
        position: "absolute",
      },
      footer: {
        transform: [{ translateY: footerTranslateY }],
        opacity,
      },
    };
  }, [isOpen]);

  const scale = cond(
    runUnmount,
    interpolate(transition, {
      inputRange: [0, 1],
      outputRange: [0.9, 1],
      extrapolate: Extrapolate.CLAMP,
    }),
    1
  );

  const postOpacity = cond(
    eq(transition, 0),
    0,
    cond(
      runUnmount,
      interpolate(transition, {
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: Extrapolate.CLAMP,
      }),
      1
    )
  );

  const overlayOpacity = cond(
    runUnmount,
    interpolate(transition, {
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: Extrapolate.CLAMP,
    }),
    transition
  );

  return useMemo(() => {
    // const focused = new Value(bin(isOpen));
    return (
      <>
        <Animated.View
          onTouchEnd={close}
          pointerEvents={isOpen ? "auto" : "none"}
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: Colors.transGray,
            opacity: overlayOpacity,
          }}
        />

        <Animated.View
          style={{
            ...styles.container,
            transform: [{ scale }],
            opacity: postOpacity,
          }}
          pointerEvents={isOpen ? "box-none" : "none"}
        >
          <Post
            light={true}
            focused={cond(isOpenValue, eq(transition, 1), neq(transition, 0))}
            dragStarted={or(
              and(runUnmount, eq(transition, 0)),
              and(not(runUnmount), neq(transition, 1))
            )}
            animate={animate}
            {...{ id }}
          />
        </Animated.View>
      </>
    );
  }, [id, isOpen]);
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FocusedPost;
