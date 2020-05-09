import React, { useContext, useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { mix } from "react-native-redash";

import { SB_HEIGHT, Colors, SCREEN_WIDTH, SCREEN_HEIGHT } from "@lib";
import { FocusedPostContext } from "@hooks";
import Post, { AnimateProp, POST_HEIGHT } from "@components/Post";

const {
  onChange,
  cond,
  abs,
  modulo,
  divide,
  round,
  multiply,
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
  lessThan,
  greaterThan,
} = Animated;

export interface FocusedPostProps {}

const FocusedPost: React.FC<FocusedPostProps> = React.memo(({}) => {
  const { id, close, origin, size, transition, isOpen } = useContext(
    FocusedPostContext
  );

  const animate: AnimateProp = {
    header: {
      transform: [{ translateY: mix(transition, 0, -215) }],
      opacity: transition,
    },
    image: {
      borderRadius: mix(transition, 5, 20),
      transform: [
        {
          translateX: mix(
            transition,
            add(-SCREEN_WIDTH / 2, size, origin.x),
            0
          ),
        },
        {
          translateY: mix(
            transition,
            sub(add(origin.y, size), SCREEN_HEIGHT / 2),
            0
          ),
        },
      ],
      left: mix(transition, sub((SCREEN_WIDTH - 40) / 2, size), 0),
      right: mix(transition, sub((SCREEN_WIDTH - 40) / 2, size), 0),
      top: mix(transition, sub(225, size), 0),
      bottom: mix(transition, sub(225, size), 0),
    },
    container: {
      position: "absolute",
    },
    footer: {
      transform: [{ translateY: mix(transition, 0, 245) }],
      opacity: transition,
    },
  };

  return useMemo(
    () => (
      <Animated.View
        style={{ ...styles.container, opacity: cond(eq(transition, 0), 0, 1) }}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Animated.View
          onTouchEnd={close}
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: Colors.nearBlack,
            opacity: mix(transition, 0, 0.7),
          }}
        />
        <Post
          light
          dragStarted={neq(transition, 1)}
          animate={animate}
          {...{ id }}
        />
      </Animated.View>
    ),
    [id, isOpen]
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FocusedPost;
