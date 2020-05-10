import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { connect, ConnectedProps } from "react-redux";

import { Colors, TextStyles } from "@lib";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";

import CommentPreview from "./CommentPreview";

const mapStateToProps = (state: RootState) => ({
  loading: selectors.commentsLoading(state),
});

const mapDispatchToProps = {
  sendComment: PostActions.sendComment,
};

export interface CommentsProps {
  postId: string;
  comments: CommentType[];
  onPressMore: (postId: string) => void;
  onPressCompose: (postId: string) => void;
}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comments: React.FC<CommentsProps & CommentsConnectedProps> = ({
  onPressMore,
  onPressCompose,
  loading,
  postId,
  comments = [],
}) => {
  const handleOnPressMore = () => onPressMore(postId);
  const handleOnPressCompose = () => onPressCompose(postId);

  return (
    <View style={styles.container}>
      {comments.length > 1 && (
        <TouchableOpacity onPress={handleOnPressMore}>
          <Text style={styles.preview}>{`${
            comments.length - 1
          } more comments`}</Text>
        </TouchableOpacity>
      )}
      {comments.length > 0 && (
        <CommentPreview {...comments[comments.length - 1]} />
      )}
      <TouchableOpacity onPress={handleOnPressCompose} style={styles.composer}>
        <Text style={styles.text}>add a comment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    backgroundColor: "white",
    paddingHorizontal: 5,
    width: "100%",
    alignSelf: "stretch",
  },
  composer: {
    backgroundColor: Colors.lightGray,
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  text: {
    flex: 1,
    ...TextStyles.small,
    color: Colors.gray,
  },
  preview: {
    ...TextStyles.small,
    marginBottom: 2,
    opacity: 0.6,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Comments);
