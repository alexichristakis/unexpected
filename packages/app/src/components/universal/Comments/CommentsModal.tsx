import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import Animated from "react-native-reanimated";

import {
  ModalList,
  ItemSeparator,
  UserRow,
  ModalListRef
} from "@components/universal";
import { Actions as PostActions } from "@redux/modules/post";
import { User } from "@unexpected/global";
import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { Comment as CommentType } from "@unexpected/global";
import { SCREEN_HEIGHT } from "@lib/constants";

import Comment from "./Comment";
import FloatingComposer from "./FloatingComposer";
import { useValues } from "react-native-redash";
import { Keyboard } from "react-native";

const { useCode, cond, block, call, greaterThan } = Animated;

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
  modalRef: React.RefObject<ModalListRef>;
}

export const CommentsModal: React.FC<CommentsModalProps &
  CommentsModalConnectedProps> = React.memo(
  ({ data, modalRef, phoneNumber, postId, loading, sendComment }) => {
    const [offsetY] = useValues([SCREEN_HEIGHT], []);

    useCode(
      () =>
        block([
          cond(
            greaterThan(offsetY, SCREEN_HEIGHT / 2),
            call([], Keyboard.dismiss)
          )
        ]),
      []
    );

    const handleOnFocus = () => modalRef.current?.openFully();

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
          offsetY={offsetY}
          style={{ paddingHorizontal: 5 }}
        >
          {data.map(renderComment)}
        </ModalList>
        <FloatingComposer
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
