import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from "react-native";
import Animated, {
  Transition,
  Transitioning,
  TransitioningView
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";

import Comment from "./Comment";
import Composer from "./Composer";
import { TextStyles } from "@lib/styles";

import { StackParamList } from "../../../App";

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
  detail: boolean;
  visible: boolean;
  onPressMore: (postId: string) => void;
  transitionRef?: React.Ref<TransitioningView>;
}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comments: React.FC<CommentsProps & CommentsConnectedProps> = ({
  transitionRef,
  detail,
  visible,
  onPressMore,
  loading,
  postId,
  phoneNumber,
  comments = [],
  sendComment
}) => {
  const [focused, setFocused] = useState(false);

  const handleOnPressMore = () => onPressMore(postId);

  const handleOnFocus = () => {
    setFocused(true);
  };

  const handleOnBlur = () => {
    setFocused(false);
  };

  const handleOnSendMessage = (body: string) => {
    sendComment({ body, phoneNumber, postId });
  };

  const transition = (
    <Transition.Together>
      <Transition.In type="fade" />
      <Transition.Out type="fade" />
      <Transition.Change interpolation="easeInOut" />
    </Transition.Together>
  );

  // if (comments.length)
  return (
    <Transitioning.View
      style={styles.container}
      ref={transitionRef}
      transition={transition}
    >
      <KeyboardAvoidingView enabled={false} behavior={"padding"}>
        {comments.length > 1 && !detail && (
          <TouchableOpacity onPress={handleOnPressMore}>
            <Text style={styles.preview}>{`${comments.length -
              1} more comments`}</Text>
          </TouchableOpacity>
        )}
        {comments.length > 0 && !detail && (
          <Comment {...comments[comments.length - 1]} />
        )}
        {detail &&
          comments.map(comment => <Comment key={comment.id} {...comment} />)}

        <Composer
          loading={loading}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          onSendMessage={handleOnSendMessage}
        />
      </KeyboardAvoidingView>
    </Transitioning.View>
  );
  // return null;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    backgroundColor: "white",
    paddingHorizontal: 10,
    width: "100%",
    alignSelf: "stretch"
  },
  preview: {
    ...TextStyles.small,
    marginBottom: 2,
    opacity: 0.6
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Comments);

export { default as CommentsModal } from "./CommentsModal";
