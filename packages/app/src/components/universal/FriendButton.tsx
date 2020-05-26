import React, { useCallback } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { connect, ConnectedProps } from "react-redux";

/* some svgs */
import PlusSVG from "@assets/svg/plus.svg";

import { TextStyles, Colors } from "@lib";
import { FriendActions } from "@redux/modules";
import * as selectors from "@redux/selectors";
import { FriendingState, RootState } from "@redux/types";

const ICON_SIZE = 30;

export interface FriendButtonProps {
  id: string;
  light?: boolean;
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
  }
);

export type FriendButtonConnectedProps = ConnectedProps<typeof connector>;

const FriendButton: React.FC<
  FriendButtonProps & FriendButtonConnectedProps
> = ({
  id,
  showLabel,
  light,
  loading,
  friendingState,
  deleteFriend,
  friend,
}) => {
  const color = light ? Colors.lightGray : Colors.nearBlack;

  const renderButton = () => {
    switch (friendingState) {
      case FriendingState.RECEIVED: {
        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={{ ...styles.button, backgroundColor: "#0099CC" }}
              onPress={() => friend(id)}
            >
              <Text style={{ ...styles.buttonText, color: Colors.lightGray }}>
                accept
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginLeft: 10,
                borderWidth: 1,
                borderColor: color,
                ...styles.button,
              }}
              onPress={() => deleteFriend(id)}
            >
              <Text style={{ ...styles.buttonText, color }}>delete</Text>
            </TouchableOpacity>
          </View>
        );
      }

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
          <TouchableOpacity
            style={{ ...styles.button, borderWidth: 1 }}
            onPress={action}
          >
            <Text style={styles.buttonText}>friends</Text>
          </TouchableOpacity>
        );
      }

      case FriendingState.REQUESTED: {
        return (
          <TouchableOpacity
            style={{ ...styles.button, borderWidth: 1 }}
            onPress={() => deleteFriend(id)}
          >
            <Text style={styles.buttonText}>requested</Text>
          </TouchableOpacity>
        );
      }

      case FriendingState.CAN_FRIEND: {
        return (
          <TouchableOpacity
            style={{ ...styles.button, backgroundColor: "#0099CC" }}
            onPress={() => friend(id)}
          >
            <PlusSVG width={10} height={10} />
            <Text
              style={{
                ...styles.buttonText,
                color: Colors.lightGray,
                marginLeft: 2,
              }}
            >
              add
            </Text>
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    // borderWidth: 1,
    borderRadius: 5,
  },
  buttonText: {
    ...TextStyles.small,
  },
  label: {
    ...TextStyles.small,
    marginRight: 10,
  },
});

export default connector(FriendButton);
