import React, { useState } from "react";
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";

import Comment from "./Comment";
import Composer from "./Composer";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state),
  loading: selectors.commentsLoading(state)
});

const mapDispatchToProps = {
  sendComment: PostActions.sendComment
};

export interface CommentsProps {
  postId: string;
  comments: CommentType[];
}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comments: React.FC<CommentsProps & CommentsConnectedProps> = ({
  loading,
  postId,
  phoneNumber,
  comments = [],
  sendComment
}) => {
  const [focused, setFocused] = useState(false);

  const handleOnFocus = () => {
    setFocused(true);
  };

  const handleOnBlur = () => {
    setFocused(false);
  };

  const handleOnSendMessage = (body: string) => {
    sendComment({ body, phoneNumber, postId });
  };

  return (
    <KeyboardAvoidingView enabled={focused} behavior={"position"}>
      <Animated.View style={styles.container}>
        {comments.map(comment => (
          <Comment key={comment.id} {...comment} />
        ))}
        <Composer
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          onSendMessage={handleOnSendMessage}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    backgroundColor: "white",
    paddingHorizontal: 10,
    width: "100%",
    alignSelf: "stretch"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Comments);
