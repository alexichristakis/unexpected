import React, { useState } from "react";
import { StyleSheet, ViewStyle, View, Text } from "react-native";
import { connect } from "react-redux";
import { UserType } from "unexpected-cloud/models/user";

import { Actions as UserActions } from "@redux/modules/user";
import { ReduxPropsType, RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { Button } from "./Button";
import { TextStyles, TextSizes } from "@lib/styles";

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
  showLabel?: boolean;
  size?: TextSizes;
  style?: ViewStyle;
}

const FriendButton: React.FC<FriendButtonProps & FriendButtonReduxProps> = ({
  style,
  showLabel,
  user,
  size = TextSizes.medium,
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
          size={size}
          style={[styles.button, style]}
          title={title(state)}
          onPress={action(state)}
        />
      );
    else
      return (
        <View style={styles.flex}>
          {showLabel && (
            <Text
              style={styles.label}
            >{`${user.firstName} wants to be friends:`}</Text>
          )}
          <View style={styles.buttonContainer}>
            <Button
              style={styles.button}
              size={size}
              title="accept"
              onPress={() => acceptRequest(user)}
            />
            <Button
              style={[styles.button, { marginLeft: 10 }]}
              size={size}
              title="delete"
              onPress={() => denyRequest(user)}
            />
          </View>
        </View>
      );
  }
  return null;
};

const styles = StyleSheet.create({
  flex: { flex: 1, width: "100%" },
  buttonContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    // justifyContent: "space-between",
    flexDirection: "row"
  },
  label: {
    ...TextStyles.medium,
    marginBottom: 10
  },
  button: {
    flex: 1
    // alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FriendButton);
