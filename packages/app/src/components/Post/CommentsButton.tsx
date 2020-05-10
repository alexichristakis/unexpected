import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, { useCode, interpolate } from "react-native-reanimated";

import { TextStyles, Colors } from "@lib";

import {
  useValues,
  useValue,
  useGestureHandler,
  withTransition,
  mix,
} from "react-native-redash";
import { TapGestureHandler, State } from "react-native-gesture-handler";

const { cond, onChange, set, eq } = Animated;

export interface CommentsButtonProps {
  numComments: number;
  open: Animated.Value<0 | 1>;
}

const CommentsButton: React.FC<CommentsButtonProps> = React.memo(
  ({ open, numComments }) => {
    const state = useValue(State.UNDETERMINED);
    const [] = useValues<0 | 1>([0]);

    const handler = useGestureHandler({ state });

    useCode(
      () => [
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
      <TapGestureHandler {...handler}>
        <Animated.View style={styles.commentIndicator}>
          <Animated.Text
            style={{
              position: "absolute",
              opacity: mix(transition, 1, 0),
              ...TextStyles.medium,
            }}
          >
            {numComments}
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
    );
  },
  (p, n) => p.numComments === n.numComments
);

const styles = StyleSheet.create({
  commentIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightpink",
  },
});

export default CommentsButton;
