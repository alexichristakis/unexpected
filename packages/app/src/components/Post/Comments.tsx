import React, { useEffect, useState } from "react";
import Animated, { useCode } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { StyleSheet, ScrollView, ViewBase } from "react-native";

import { SCREEN_WIDTH, Colors } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@global";

import Comment from "./Comment";
import Composer from "./Composer";
import { bin } from "react-native-redash";

const { onChange, cond, call } = Animated;

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
  visible: Animated.Adaptable<0 | 1>;
}

const comments: CommentType[] = [
  {
    id: "0",
    user: { firstName: "alexi", lastName: "christakis" },
    body: "this is a comment",
    post: "post",
  },
  {
    id: "1",
    user: { firstName: "alexi", lastName: "christakis" },
    body: "this is a comment",
    post: "post",
  },
  {
    id: "2",
    user: { firstName: "alexi", lastName: "christakis" },
    body:
      "this is a comment this is a comment this is a comment this is a comment this is a comment this is a comment this is a comment",
    post: "post",
  },
  {
    id: "3",
    user: { firstName: "alexi", lastName: "christakis" },
    body: "this is a comment",
    post: "post",
  },
  {
    id: "4",
    user: { firstName: "alexi", lastName: "christakis" },
    body: "this is a comment",
    post: "post",
  },
  {
    id: "5",
    user: { firstName: "alexi", lastName: "christakis" },
    body:
      "this is a commentthis is a commentthis is a commentthis is a commentthis is a commentthis is a commentlong long comment",
    post: "post",
  },
];

const Comments: React.FC<CommentsProps & CommentsConnectedProps> = ({
  translateX,
  visible,
  // comments
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {});

  useCode(
    () => [
      onChange(
        visible,
        call([visible], ([visible]) => setIsVisible(!!visible))
      ),
    ],
    []
  );

  const handleOnComment = (comment: string) => {
    console.log(comment);
  };

  if (isVisible)
    return (
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateX: SCREEN_WIDTH }, { translateX }] },
        ]}
      >
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={styles.contentContainer}
        >
          {comments.map((comment) => (
            <Comment key={comment.id} {...comment} />
          ))}
        </ScrollView>
        <Composer onComment={handleOnComment} />
      </Animated.View>
    );

  return null;
};

const styles = StyleSheet.create({
  container: {
    height: 450,
    borderRadius: 20,
    width: "100%",
    backgroundColor: Colors.lightGray,
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
  },
});

export default connector(Comments);
