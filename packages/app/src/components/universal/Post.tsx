import React, { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import _ from "lodash";
import moment from "moment";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { FEED_POST_WIDTH } from "@lib/constants";
import { Colors, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Comments from "./Comments";

export interface PostProps {
  postId: string;
  renderImage: () => JSX.Element;
  onPressName?: () => void;
}

export type PostRef = {
  setVisible: () => void;
  setNotVisible: () => void;
};

export type PostConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: PostProps) => ({
  post: selectors.post(state, props)
});
const mapDispatchToProps = {};

const Post = React.memo(
  React.forwardRef<PostRef, PostConnectedProps & PostProps>(
    ({ post, onPressName, renderImage }, ref) => {
      const { description, user, createdAt, comments } = post;

      useImperativeHandle(ref, () => ({
        setVisible: () => console.log("visible"),
        setNotVisible: () => console.log("not visible")
      }));

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onPressName}>
              <Text style={[TextStyles.large, styles.name]}>
                {formatName(user)}
              </Text>
            </TouchableOpacity>
            <Text style={TextStyles.small}>{moment(createdAt).fromNow()}</Text>
          </View>
          {renderImage()}
          <Text style={styles.description}>{description}</Text>
          <Comments postId={post.id} comments={comments} />
        </View>
      );
    }
  ),
  (prevProps, nextProps) => _.isEqual(prevProps.post, nextProps.post)
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 40
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },
  name: {
    marginBottom: 10
  },
  description: {
    ...TextStyles.medium,
    marginTop: 10,
    paddingHorizontal: 20
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
});
export default connector(Post);
