import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  ActionSheetIOS,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import _ from "lodash";
import moment from "moment";
import { TransitioningView } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import Comments from "@components/Comments/Comments";
import { Colors, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import MoreIcon from "@assets/svg/more.svg";

export interface PostProps {
  postId: string;
  onPressMoreComments: (postId: string) => void;
  onPressComposeComment: (postId: string) => void;
  renderImage: () => JSX.Element;
  onPressName: (phoneNumber: string) => void;
}

export type PostRef = {
  setVisible: () => void;
  setNotVisible: () => void;
};

export type PostConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: PostProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  post: selectors.post(state, props)
});

const mapDispatchToProps = { deletePost: PostActions.deletePost };

const Post = React.memo(
  React.forwardRef<PostRef, PostConnectedProps & PostProps>(
    (
      {
        post,
        phoneNumber,
        onPressName,
        onPressMoreComments,
        onPressComposeComment,
        renderImage,
        deletePost
      },
      ref
    ) => {
      const commentsTransitionRef = React.createRef<TransitioningView>();
      const [visible, setVisible] = useState(false);

      const { id, description, user, createdAt, comments } = post;

      const isUser = user?.phoneNumber === phoneNumber;

      useImperativeHandle(ref, () => ({
        setVisible: () => {
          setTimeout(() => {
            commentsTransitionRef.current?.animateNextTransition();
            setVisible(true);
          }, 500);
        },
        setNotVisible: () => {
          commentsTransitionRef.current?.animateNextTransition();
          setVisible(false);
        }
      }));

      const handleOnPressName = () => {
        onPressName(user.phoneNumber);
      };

      const handleOnPressMoreIcon = () => {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["delete post", "cancel"],
            destructiveButtonIndex: 0,
            cancelButtonIndex: 1
          },
          index => {
            if (!index) {
              deletePost(id);
            }
          }
        );
      };

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <TouchableOpacity onPress={handleOnPressName}>
                <Text style={TextStyles.large}>{formatName(user)}</Text>
              </TouchableOpacity>
              <Text style={styles.time}>{moment(createdAt).fromNow()}</Text>
            </View>
            {isUser && (
              <TouchableOpacity onPress={handleOnPressMoreIcon}>
                <MoreIcon width={20} height={20} />
              </TouchableOpacity>
            )}
          </View>
          {renderImage()}
          {description.length ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
          <Comments
            onPressCompose={onPressComposeComment}
            onPressMore={onPressMoreComments}
            postId={post.id}
            comments={comments}
          />
        </View>
      );
    }
  ),
  (prevProps, nextProps) => _.isEqual(prevProps.post, nextProps.post)
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 30
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10
  },
  time: {
    ...TextStyles.small,
    color: Colors.gray
  },
  name: {
    marginBottom: 10
  },
  description: {
    ...TextStyles.small,
    marginTop: 10,
    paddingHorizontal: 5
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
});
export default connector(Post);
