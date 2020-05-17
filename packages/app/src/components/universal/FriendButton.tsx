import React, { useCallback } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  ActionSheetIOS,
} from "react-native";
import { connect, ConnectedProps } from "react-redux";

/* some svgs */
import PendingFriendSVG from "@assets/svg/arrow_button.svg";
import DenySVG from "@assets/svg/cancel_button.svg";
import CheckSVG from "@assets/svg/check_button.svg";
import AddFriendSVG from "@assets/svg/plus_button.svg";

import { TextStyles } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState, FriendingState } from "@redux/types";
import { FriendActions } from "@redux/modules";

const ICON_SIZE = 30;

export interface FriendButtonProps {
  id: string;
  showLabel?: boolean;
}

const connector = connect(
  (state: RootState, props: FriendButtonProps) => ({
    friendingState: selectors.friendingState(state, props),
    loading: selectors.loadingFriendRequest(state),
  }),
  {
    deleteFriend: FriendActions.deleteFriend,
    friend: FriendActions.friendUser,
    acceptRequest: FriendActions.acceptRequest,
    denyRequest: FriendActions.denyRequest,
    cancelRequest: FriendActions.cancelRequest,
  }
);

export type FriendButtonConnectedProps = ConnectedProps<typeof connector>;

const FriendButton: React.FC<
  FriendButtonProps & FriendButtonConnectedProps
> = ({
  id,
  showLabel,
  loading,
  friendingState,
  deleteFriend,
  friend,
  acceptRequest,
  denyRequest,
  cancelRequest,
}) => {
  const renderButton = () => {
    switch (friendingState) {
      case FriendingState.FRIENDS: {
        const action = () =>
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ["remove friend", "cancel"],
              destructiveButtonIndex: 0,
              cancelButtonIndex: 1,
            },
            (index) => {
              if (!index) {
                deleteFriend(id);
              }
            }
          );

        return (
          <TouchableOpacity onPress={action}>
            <CheckSVG width={ICON_SIZE} height={ICON_SIZE} />
          </TouchableOpacity>
        );
      }

      case FriendingState.REQUESTED: {
        return (
          <TouchableOpacity onPress={() => cancelRequest(id)}>
            <PendingFriendSVG width={ICON_SIZE} height={ICON_SIZE} />
          </TouchableOpacity>
        );
      }

      case FriendingState.RECEIVED: {
        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => acceptRequest(id)}>
              <CheckSVG width={ICON_SIZE} height={ICON_SIZE} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => denyRequest(id)}
            >
              <DenySVG width={ICON_SIZE} height={ICON_SIZE} />
            </TouchableOpacity>
          </View>
        );
      }

      case FriendingState.CAN_FRIEND: {
        return (
          <TouchableOpacity onPress={() => friend(id)}>
            <AddFriendSVG width={ICON_SIZE} height={ICON_SIZE} />
          </TouchableOpacity>
        );
      }

      default: {
        return null;
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ height: ICON_SIZE }} size={"large"} />
      ) : (
        renderButton()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  label: {
    ...TextStyles.small,
    marginRight: 10,
  },
});

export default connector(FriendButton);
