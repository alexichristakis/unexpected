import React, { useEffect, useRef, useState } from "react";
import { ActionSheetIOS, StyleSheet, Text, View } from "react-native";

import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";
import moment from "moment";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { Comment, FloatingComposer } from "@components/Comments";
import {
  ModalList,
  ModalListRef,
  PostImage,
  ZoomedImage,
  ZoomedImageType,
  ZoomHandler,
  ZoomHandlerGestureBeganPayload,
} from "@components/universal";
import { SB_HEIGHT, SCREEN_WIDTH, TextStyles } from "@lib";
import { formatName } from "@lib";
import { PostActions } from "@redux/modules";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { User } from "@unexpected/global";

import MoreIcon from "@assets/svg/more.svg";

const mapStateToProps = (state: RootState, props: PostModalProps) => ({
  currentUserPhoneNumber: selectors.phoneNumber(state),
  commentLoading: selectors.commentsLoading(state),
  post: selectors.post(state, props),
});

const mapDispatchToProps = {
  fetchPost: PostActions.fetchPost,
  deletePost: PostActions.deletePost,
  sendComment: PostActions.sendComment,
};

export type PostModalConnectedProps = ConnectedProps<typeof connector>;

export interface PostModalProps {
  onClose: () => void;
  postId: string;
}

const PostModal: React.FC<
  PostModalProps & PostModalConnectedProps
> = React.memo(
  ({
    postId,
    onClose,
    post,
    fetchPost,
    deletePost,
    currentUserPhoneNumber,
    sendComment,
    commentLoading,
  }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const [zoomedImage, setZoomedImage] = useState<ZoomedImageType>();
    const modalRef = useRef<ModalListRef>(null);

    useEffect(() => {
      if (postId) {
        fetchPost(postId);
      }
      modalRef.current?.openFully();
    }, [postId]);

    const {
      id,
      description = "",
      createdAt,
      phoneNumber,
      photoId,
      comments = [],
    } = post;

    const handleOnGestureBegan = (payload: ZoomHandlerGestureBeganPayload) =>
      setZoomedImage({
        id: photoId,
        phoneNumber,
        width: SCREEN_WIDTH,
        height: 1.2 * SCREEN_WIDTH,
        ...payload,
      });

    const handleOnGestureComplete = () => setZoomedImage(undefined);

    const handleOnPressMoreIcon = () => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["delete post", "cancel"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (index) => {
          if (!index) {
            deletePost(id);
            // navigation.goBack();
          }
        }
      );
    };

    const handleOnSendMessage = (body: string) => {
      sendComment({ body, phoneNumber: currentUserPhoneNumber, postId });
    };

    if (postId.length)
      return (
        <>
          <ModalList
            offsetY={scrollY}
            onClose={onClose}
            title={moment(createdAt).fromNow()}
            style={{ paddingBottom: 200 }}
            ref={modalRef}
          >
            <ZoomHandler
              renderKey={photoId}
              onGestureComplete={handleOnGestureComplete}
              onGestureBegan={handleOnGestureBegan}
            >
              <PostImage
                phoneNumber={phoneNumber}
                id={photoId}
                width={SCREEN_WIDTH}
                height={SCREEN_WIDTH * 1.2}
              />
            </ZoomHandler>

            <View style={styles.footer}>
              {description.length ? (
                <Text style={styles.description}>{description}</Text>
              ) : null}
              {sortBy(comments, ({ createdAt }) => createdAt).map((comment) => (
                <Comment key={comment.id} {...comment} />
              ))}
            </View>
          </ModalList>
          {zoomedImage && <ZoomedImage {...zoomedImage} />}
          <FloatingComposer
            offsetY={scrollY}
            onSendMessage={handleOnSendMessage}
            loading={commentLoading}
          />
        </>
      );

    return null;
  },
  (prevProps, nextProps) =>
    prevProps.postId === nextProps.postId &&
    isEqual(prevProps.post, nextProps.post)
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT,
  },
  footer: {
    marginTop: 5,
    paddingHorizontal: 5,
  },
  description: {
    ...TextStyles.small,
    marginBottom: 5,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PostModal);
