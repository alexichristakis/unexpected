import React from "react";

import {
  ModalList,
  ItemSeparator,
  UserRow,
  ModalListRef
} from "@components/universal";
import { User } from "@unexpected/global";

export interface UserModalProps {
  type?: "friends" | "requests";
  modalRef: React.Ref<ModalListRef>;
  onPressUser: (user: User) => void;
  data: User[];
}

export const UserModal: React.FC<UserModalProps> = React.memo(
  ({ type = "friends", data, onPressUser, modalRef }) => {
    const renderUserRow = (item: User, index: number) => (
      <>
        {index ? <ItemSeparator key={`separator-${index}`} /> : null}
        <UserRow key={`user-${index}`} user={item} onPress={onPressUser} />
      </>
    );

    return (
      <ModalList
        title={type === "friends" ? "Friends" : "Requests"}
        ref={modalRef}
      >
        {data.map(renderUserRow)}
      </ModalList>
    );
  }
);
