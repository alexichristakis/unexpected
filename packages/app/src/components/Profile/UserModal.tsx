import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { connect, ConnectedProps } from "react-redux";
import uuid from "uuid/v4";

import {
  ModalList,
  ItemSeparator,
  UserRow,
  ModalListRef
} from "@components/universal";
import { User } from "@unexpected/global";
import { Actions as UserActions } from "@redux/modules/user";
import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";

import { StackParamList } from "../../App";

type Navigation = NativeStackNavigationProp<StackParamList>;

const mapStateToProps = (state: RootState, props: UserModalProps) => ({
  currentUserPhoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state, props),
  users: selectors.users(state),
  friends: selectors.friends(state, props),
  friendsNumbers: selectors.friendsNumbers(state, props),
  requestNumbers: selectors.friendRequestNumbers(state),
  requests: selectors.friendRequests(state)
});
const mapDispatchToProps = {
  fetchUsers: UserActions.fetchUsers
};

export interface UserModalProps {
  visible: boolean;
  phoneNumber: string;
  type?: "friends" | "requests";
  onClose: () => void;
}

export type UserModalConnectedProps = ConnectedProps<typeof connector>;

const UserModal: React.FC<UserModalProps &
  UserModalConnectedProps> = React.memo(
  ({
    type = "friends",
    currentUserPhoneNumber,
    user,
    visible,
    fetchUsers,
    users,
    friendsNumbers,
    requestNumbers,
    friends,
    requests,
    onClose
  }) => {
    const modalRef = useRef<ModalListRef>(null);

    useEffect(() => {
      if (visible) {
        modalRef.current?.open();

        // fetch users
        const friendsToFetch = friendsNumbers.filter(
          phoneNumber => !users[phoneNumber]
        );
        const requestsToFetch = requestNumbers.filter(
          phoneNumber => !users[phoneNumber]
        );

        fetchUsers(type === "friends" ? friendsToFetch : requestsToFetch);
      }
    }, [visible, type]);

    const navigation = useNavigation<Navigation>();

    const handleOnPressUser = (toUser: User) => {
      if (currentUserPhoneNumber === toUser.phoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: {
            prevRoute: user.firstName,
            phoneNumber: toUser.phoneNumber
          }
        });
      }
    };

    const renderUserRow = (item: User, index: number) => (
      <React.Fragment key={`user-${index}`}>
        {index ? <ItemSeparator /> : null}
        <UserRow user={item} onPress={handleOnPressUser} />
      </React.Fragment>
    );

    const title = type === "friends" ? "Friends" : "Requests";
    const data = type === "friends" ? friends : requests;
    return (
      <ModalList title={title} ref={modalRef} onClose={onClose}>
        {data.map(renderUserRow)}
      </ModalList>
    );
  }
);

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(UserModal);
