import React, { useState } from "react";
import { StyleSheet, ViewStyle, View, Text } from "react-native";
import { connect } from "react-redux";
import { UserType } from "unexpected-cloud/models/user";

import { Actions as UserActions } from "@redux/modules/user";
import { ReduxPropsType, RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { Button } from "./Button";
import { TextStyles } from "@lib/styles";

const mapStateToProps = (state: RootState) => ({
  currentUser: selectors.user(state)
});
const mapDispatchToProps = {
  sendFriendRequest: UserActions.friendUser,
  cancelFriendRequest: UserActions.cancelRequest,
  deleteFriend: UserActions.deleteFriend,
  acceptRequest: UserActions.acceptRequest,
  denyRequest: UserActions.denyRequest
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
  cancelFriendRequest,
  deleteFriend,
  acceptRequest,
  denyRequest
}) => {
  const getState = () => {
    const { friends, requestedFriends, friendRequests } = currentUser;

    if (friends.includes(user.phoneNumber)) {
      return "friends";
    }

    if (requestedFriends.includes(user.phoneNumber)) {
      return "requested";
    }

    if (friendRequests.includes(user.phoneNumber)) {
      return "received";
    }

    return "none";
  };

  const title = (state: ReturnType<typeof getState>) => {
    switch (state) {
      case "friends":
        return "friends";
      case "requested":
        return "cancel request";
      case "none":
        return "add friend";
      default:
        return "";
    }
  };

  const action = (state: ReturnType<typeof getState>) => {
    switch (state) {
      case "friends":
        return () => deleteFriend(user);
      case "requested":
        return () => cancelFriendRequest(user);
      case "none":
        return () => sendFriendRequest(user);
      default:
        return () => {};
    }
  };

  if (currentUser.phoneNumber !== user.phoneNumber) {
    const state = getState();
    if (state !== "received")
      return (
        <Button
          style={[styles.button, style]}
          title={title(state)}
          onPress={action(state)}
        />
      );
    else
      return (
        <View style={styles.buttonContainer}>
          <Text
            style={TextStyles.medium}
          >{`${user.firstName} wants to be friends`}</Text>
          <Button
            style={[
              styles.button,
              { paddingVertical: 5, paddingHorizontal: 15 }
            ]}
            size="small"
            title="accept"
            onPress={() => acceptRequest(user)}
          />
          <Button
            style={[
              styles.button,
              { marginLeft: 5, paddingVertical: 5, paddingHorizontal: 15 }
            ]}
            size="small"
            title="delete"
            onPress={() => denyRequest(user)}
          />
        </View>
      );
  }
  return null;
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  button: {
    alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FriendButton);
