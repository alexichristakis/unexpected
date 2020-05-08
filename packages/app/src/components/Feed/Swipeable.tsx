import React, { useCallback, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, { useCode, debug } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useGestureHandler,
  useValue,
  useValues,
  withSpring,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SPRING_CONFIG } from "@lib/constants";

const { cond, set, sub, add, eq, greaterThan } = Animated;

export interface SwipeableProps {
  post: string;
  index: number;
  value: Animated.Value<number>;
  offset: Animated.Adaptable<number>;
}

const POST_IDS = ["1", "2", "3", "4", "5"];

const POST_HEIGHT = 0.75 * SCREEN_HEIGHT;

const Swipeable: React.FC<SwipeableProps> = ({
  index,
  value,
  offset,
  post,
}) => {
  const [translationY, velocity] = useValues<number>([0, 0, 0]);
  const state = useValue(State.UNDETERMINED);

  const handler = useGestureHandler({
    state,
    translationY,
    velocityY: velocity,
  });

  const handleOnSnap = useCallback(([val]: readonly number[]) => {
    console.log(val);
  }, []);

  const snapPoints = [-POST_HEIGHT, 0, POST_HEIGHT];

  const translateY = useMemoOne(
    () =>
      withSpring({
        state,
        value: translationY,
        velocity,
        snapPoints,
        onSnap: handleOnSnap,
        config: SPRING_CONFIG,
      }),
    [handleOnSnap]
  );

  useCode(() => [set(value, translateY)], []);

  //   const [prevPost, currentPost, nextPost] = posts;
  return (
    <Animated.View
      style={{
        transform: [{ translateY: add(offset, index * POST_HEIGHT) }],
        position: "absolute",
      }}
    >
      <PanGestureHandler {...handler}>
        <Animated.View
          style={{
            transform: [{ translateY }],
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            height: POST_HEIGHT,
            width: SCREEN_WIDTH - 40,
            marginBottom: 50,
            backgroundColor: "red",
          }}
        >
          <Text>{post}</Text>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

export default Swipeable;
