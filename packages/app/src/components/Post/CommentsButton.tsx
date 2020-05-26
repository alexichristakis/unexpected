import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useCode } from "react-native-reanimated";

import { Colors, TextStyles } from "@lib";

import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  mix,
  useGestureHandler,
  useValue,
  withTransition,
} from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

const { cond, onChange, set, eq } = Animated;

const connector = connect(
  (state: RootState, props: CommentsButtonProps) => ({
    numComments: selectors.numComments(state, props),
  }),
  {}
);

export interface CommentsButtonProps {
  id: string;
  open: Animated.Value<0 | 1>;
}

export type CommentsButtonConnectedProps = ConnectedProps<typeof connector>;

const CommentsButton: React.FC<
  CommentsButtonProps & CommentsButtonConnectedProps
> = React.memo(
  ({ open, numComments }) => {
    const state = useValue(State.UNDETERMINED);

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
    const pressInTransition = withTransition(eq(state, State.BEGAN), {
      easing: Easing.ease,
      duration: 200,
    });

    return (
      <TapGestureHandler {...handler}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: mix(pressInTransition, 1, 1.5) }] },
          ]}
        >
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
  container: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightpink",
  },
});

export default connector(CommentsButton);
