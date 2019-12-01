import React, { useState } from "react";
import { connect } from "react-redux";

import { Actions as UserActions } from "@redux/modules/user";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import { ReduxPropsType, RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { Button } from "@components/universal";
import { UserType } from "unexpected-cloud/models/user";
import { StyleSheet } from "react-native";

const mapStateToProps = (state: RootState) => ({
  currentUser: selectors.user(state)
});
const mapDispatchToProps = {
  sendFriendRequest: UserActions.friendUser,
  denyFriendRequest: UserActions.denyRequest
};

export type FriendButtonReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

export interface FriendButtonProps {
  user: Partial<UserType>;
}

const FriendButton: React.FC<FriendButtonProps & FriendButtonReduxProps> = ({
  user,
  currentUser,
  sendFriendRequest,
  denyFriendRequest
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
        return () => {};
      case "requested":
        return () => denyFriendRequest(user);
      case "none":
        return () => sendFriendRequest(user);
    }
  };

  if (currentUser.phoneNumber !== user.phoneNumber)
    return <Button style={styles.button} title={title()} onPress={action()} />;
  return null;
};

const styles = StyleSheet.create({
  button: {
    width: "100%"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FriendButton);
