import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  ActionSheetIOS,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";
import Animated from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";
import isEqual from "lodash/isEqual";
import uuid from "uuid/v4";

import {
  NavBar,
  PostImage,
  ModalList,
  ItemSeparator,
  UserRow,
  ModalListRef,
  ZoomedImage,
  ZoomedImageType,
  ZoomHandler,
  ZoomHandlerGestureBeganPayload
} from "@components/universal";
import { Comment, FloatingComposer } from "@components/Comments";
import { useDarkStatusBar } from "@hooks";
import { SB_HEIGHT, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { User } from "@unexpected/global";

import MoreIcon from "@assets/svg/more.svg";

const mapStateToProps = (state: RootState, props: PostModalProps) => ({
  currentUserPhoneNumber: selectors.phoneNumber(state),
  commentLoading: selectors.commentsLoading(state),
  post: selectors.post(state, props)
});

const mapDispatchToProps = {
  fetchPost: PostActions.fetchPost,
  deletePost: PostActions.deletePost,
  sendComment: PostActions.sendComment
};

export type PostModalConnectedProps = ConnectedProps<typeof connector>;

export interface PostModalProps {
  onClose: () => void;
  postId: string;
}

const PostModal: React.FC<PostModalProps &
  PostModalConnectedProps> = React.memo(
  ({
    postId,
    onClose,
    post,
    fetchPost,
    deletePost,
    currentUserPhoneNumber,
    sendComment,
    commentLoading
  }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const [zoomedImage, setZoomedImage] = useState<ZoomedImageType>();
    const modalRef = useRef<ModalListRef>(null);

    useEffect(() => {
      if (postId) fetchPost(postId);
      modalRef.current?.openFully();
    }, [postId]);

    const isUser = currentUserPhoneNumber === post.phoneNumber;

    const handleOnPressName = () => {
      // if (isUser) {
      //   navigation.navigate("USER_PROFILE");
      // } else {
      //   navigation.navigate({
      //     name: "PROFILE",
      //     key: uuid(),
      //     params: {
      //       prevRoute: "Post",
      //       phoneNumber: post.phoneNumber
      //     }
      //   });
      // }
    };

    const {
      id,
      description = "",
      createdAt,
      phoneNumber,
      photoId,
      comments = []
    } = post;

    const handleOnGestureBegan = (payload: ZoomHandlerGestureBeganPayload) =>
      setZoomedImage({
        id: photoId,
        phoneNumber,
        width: SCREEN_WIDTH,
        height: 1.2 * SCREEN_WIDTH,
        ...payload
      });

    const handleOnGestureComplete = () => setZoomedImage(undefined);

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
            {isUser && (
              <TouchableOpacity onPress={handleOnPressMoreIcon}>
                <MoreIcon width={20} height={20} />
              </TouchableOpacity>
            )}
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
              {comments.map(comment => (
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
    paddingTop: SB_HEIGHT()
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 15
  },
  footer: {
    marginTop: 5,
    paddingHorizontal: 5
  },
  description: {
    ...TextStyles.small,
    marginBottom: 5
  },
  scrollContentContainer: {
    paddingBottom: 50
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PostModal);
