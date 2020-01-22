import React from "react";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment } from "@unexpected/global";

const mapStateToProps = (state: RootState) => ({
  user: selectors.currentUser(state)
});

const mapDispatchToProps = {
  sendComment: PostActions.sendComment,
  deleteComment: PostActions.deleteComment
};

export interface CommentsProps {
  comments: Comment[];
}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comments: React.FC<CommentsProps & CommentsConnectedProps> = ({
  user,
  comments,
  sendComment,
  deleteComment
}) => {
  //   return <Animated.View></Animated.View>;
  return null;
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(Comments);
