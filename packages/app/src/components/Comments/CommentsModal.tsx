import React, { useState, useRef, useEffect } from "react";
import { Keyboard, KeyboardEvent, ScrollView, TextInput } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import Animated, { Easing } from "react-native-reanimated";
import { useValues, useDiff } from "react-native-redash";

import { ModalList, ModalListRef } from "@components/universal";
import { Actions as PostActions } from "@redux/modules/post";
import { User } from "@unexpected/global";
import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { Comment as CommentType } from "@unexpected/global";
import { SCREEN_HEIGHT } from "@lib/constants";

import Comment from "./Comment";
import FloatingComposer from "./FloatingComposer";

const {
  useCode,
  debug,
  cond,
  and,
  block,
  call,
  greaterThan,
  diff,
  lessThan,
  greaterOrEq
} = Animated;

const mapStateToProps = (state: RootState, props: CommentsModalProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  data: selectors.commentsForPost(state, props),
  loading: selectors.commentsLoading(state)
});

const mapDispatchToProps = {
  sendComment: PostActions.sendComment
};

export type CommentsModalConnectedProps = ConnectedProps<typeof connector>;

export interface CommentsModalProps {
  postId: string;
  textInputRef: React.RefObject<TextInput>;
  modalRef: React.RefObject<ModalListRef>;
}

export const CommentsModal: React.FC<CommentsModalProps &
  CommentsModalConnectedProps> = React.memo(
  ({
    data,
    modalRef,
    textInputRef,
    phoneNumber,
    postId,
    loading,
    sendComment
  }) => {
    const [offsetY, keyboardHeight] = useValues([SCREEN_HEIGHT, 0], []);
    const [offsetDiffY] = useState(useDiff(offsetY, []));

    const scrollRef = useRef<Animated.ScrollView>(null);

    const onKeyboardWillShow = (event: KeyboardEvent) => {
      const {
        endCoordinates: { height }
      } = event;

      console.log("keyboard will show");

      Animated.timing(keyboardHeight, {
        toValue: height,
        duration: 100,
        easing: Easing.ease
      }).start(() => scrollRef.current?.getNode().scrollToEnd());
    };

    const onKeyboardWillHide = (event: KeyboardEvent) => {
      const {
        endCoordinates: { height }
      } = event;

      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 100,
        easing: Easing.ease
      }).start();
    };

    useEffect(() => {
      const listeners = [
        Keyboard.addListener("keyboardWillShow", onKeyboardWillShow),
        Keyboard.addListener("keyboardWillHide", onKeyboardWillHide)
      ];

      return () => {
        listeners.forEach(listener => listener.remove());
      };
    }, []);

    useCode(
      () =>
        block([
          // debug("offsetDiff", offsetDiffY),
          cond(
            and(
              greaterThan(offsetDiffY, 0),
              greaterThan(offsetY, SCREEN_HEIGHT / 2)
            ),
            call([], Keyboard.dismiss)
          )
        ]),
      []
    );

    const handleOnFocus = () =>
      setTimeout(() => modalRef.current?.openFully(), 50);

    const renderComment = (item: CommentType, index: number) => (
      <Comment key={`user-${index}`} {...item} />
    );

    const handleOnSendMessage = (body: string) => {
      sendComment({ body, phoneNumber, postId });
    };

    return (
      <>
        <ModalList
          title="Comments"
          ref={modalRef}
          scrollRef={scrollRef}
          offsetY={offsetY}
          style={{ paddingHorizontal: 5 }}
        >
          {data.map(renderComment)}
          <Animated.View style={{ height: keyboardHeight }} />
        </ModalList>
        <FloatingComposer
          textInputRef={textInputRef}
          onFocus={handleOnFocus}
          offsetY={offsetY}
          loading={loading}
          onSendMessage={handleOnSendMessage}
        />
      </>
    );
  }
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(CommentsModal);
