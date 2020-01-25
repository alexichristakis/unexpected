import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";

const mapStateToProps = (state: RootState, props: CommentProps) => ({
  user: selectors.user(state, props)
});

const mapDispatchToProps = {
  sendComment: PostActions.sendComment
};

interface CommentProps extends CommentType {}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comment: React.FC<CommentProps & CommentsConnectedProps> = ({
  user,
  body
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Text style={styles.name}>{formatName(user)}:</Text>
      </TouchableOpacity>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 2
  },
  name: {
    ...TextStyles.small,
    fontWeight: "600",
    marginRight: 3
  },
  body: {
    ...TextStyles.small
  }
});
const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Comment);
