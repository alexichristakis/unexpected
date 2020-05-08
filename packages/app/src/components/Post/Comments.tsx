import React from "react";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { StyleSheet } from "react-native";

import { SCREEN_WIDTH } from "@lib/constants";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Comment from "./Comment";

const connector = connect(
  (state: RootState, props: CommentsProps) => ({
    comments: selectors.commentsForPost(state, props),
  }),
  {}
);

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

export interface CommentsProps {
  postId: string;
  translateX: Animated.Adaptable<number>;
}

const Comments: React.FC<CommentsProps & CommentsConnectedProps> = ({
  translateX,
  comments,
}) => {
  return (
    <Animated.ScrollView
      style={[
        styles.container,
        { transform: [{ translateX: SCREEN_WIDTH }, { translateX }] },
      ]}
    >
      {comments.map((comment) => (
        <Comment {...comment} />
      ))}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 450,
    borderRadius: 20,
    padding: 10,
    width: "100%",
    backgroundColor: "gray",
  },
});

export default connector(Comments);
