import React, { useState } from "react";
import { connect } from "react-redux";

import { Actions as UserActions } from "@redux/modules/user";
import { ReduxPropsType, RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { Button } from "@components/universal";
import { UserType } from "unexpected-cloud/models/user";
import { StyleSheet, ViewStyle } from "react-native";

const mapStateToProps = (state: RootState) => ({
  currentUser: selectors.user(state)
});
const mapDispatchToProps = {
  sendFriendRequest: UserActions.friendUser,
  denyFriendRequest: UserActions.denyRequest,
  deleteFriend: UserActions.deleteFriend
};

export type FriendButtonReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

export interface FriendButtonProps {
  user: UserType;
  style?: ViewStyle;
}

const FriendButton: React.FC<FriendButtonProps & FriendButtonReduxProps> = ({
  style,
  user,
  currentUser,
  sendFriendRequest,
  denyFriendRequest,
  deleteFriend
}) => {
  const getState = () => {
    const { friends, requestedFriends } = currentUser;

    if (friends.includes(user.phoneNumber)) {
      return "friends";
    }

    if (requestedFriends.includes(user.phoneNumber)) {
      return "requested";
    }

    return "none";
  };

  const title = () => {
    switch (getState()) {
      case "friends":
        return "friends";
      case "requested":
        return "cancel request";
      case "none":
        return "add friend";
    }
  };

  const action = () => {
    switch (getState()) {
      case "friends":
        return () => deleteFriend(user);
      case "requested":
        return () => denyFriendRequest(user);
      case "none":
        return () => sendFriendRequest(user);
      default:
        return () => {};
    }
  };

  if (currentUser.phoneNumber !== user.phoneNumber)
    return (
      <Button
        style={[styles.button, style]}
        title={title()}
        onPress={action()}
      />
    );
  return null;
};

const styles = StyleSheet.create({
  button: {
    // width: "100%"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FriendButton);
