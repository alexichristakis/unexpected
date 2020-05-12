import React, { useEffect, useState } from "react";
import Animated, { useCode, Value } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { StyleSheet, ScrollView } from "react-native";

import { SCREEN_WIDTH, Colors } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Comment from "./Comment";
import Composer from "./Composer";

const { onChange, cond, call } = Animated;

const comments: CommentType[] = [
  {
    id: "0",
    user: "5df4235c379aefb72228de51",
    body: "this is a comment",
    post: "post",
  },
  {
    id: "5",
    user: "5df4235c379aefb72228de51",
    body:
      "this is a commentthis is a commentthis is a commentthis is a commentthis is a commentthis is a commentlong long comment",
    post: "post",
  },
];

const connector = connect(
  (state: RootState, props: CommentsProps) => ({
    loading: selectors.sendingComment(state),
    comments: selectors.commentsForPost(state, props),
  }),
  {}
);

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

export interface CommentsProps {
  postId: string;
  navigateToProfile: (userId: string) => void;
  translateX: Animated.Adaptable<number>;
  focused?: Animated.Adaptable<0 | 1>;
}

const Comments: React.FC<CommentsProps & CommentsConnectedProps> = ({
  loading,
  translateX,
  navigateToProfile,
  focused = new Value(1),
  // comments,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {});

  useCode(
    () => [
      onChange(
        focused,
        call([focused], ([focused]) => setIsVisible(!!focused))
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
            <Comment
              key={comment.id}
              navigateToProfile={navigateToProfile}
              {...comment}
            />
          ))}
        </ScrollView>
        <Composer loading={loading} onComment={handleOnComment} />
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
