import { User } from "@unexpected/global";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  Transition,
  Transitioning,
  TransitioningView
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

/* some svgs */
import PendingFriendSVG from "@assets/svg/arrow_button.svg";
import DenySVG from "@assets/svg/cancel_button.svg";
import CheckSVG from "@assets/svg/check_button.svg";
import AddFriendSVG from "@assets/svg/plus_button.svg";

import { TextStyles } from "@lib/styles";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

const ICON_SIZE = 30;

export interface FriendButtonProps {
  user: User;
  showLabel?: boolean;
}

const mapStateToProps = (state: RootState) => ({
  friendRequests: selectors.friendRequestNumbers(state),
  requestedFriends: selectors.requestedFriendNumbers(state),
  refreshing: selectors.userRequestsLoading(state),
  currentUser: selectors.currentUser(state),
  error: selectors.userError(state)
});
const mapDispatchToProps = {
  deleteFriend: UserActions.deleteFriend,
  sendFriendRequest: UserActions.friendUser,
  acceptRequest: UserActions.acceptRequest,
  denyRequest: UserActions.denyRequest,
  cancelRequest: UserActions.cancelRequest
};

export type FriendButtonConnectedProps = ConnectedProps<typeof connector>;

const FriendButton: React.FC<FriendButtonProps &
  FriendButtonConnectedProps> = ({
  refreshing,
  friendRequests,
  requestedFriends,
  showLabel,
  error,
  user,
  currentUser,
  sendFriendRequest,
  denyRequest,
  cancelRequest,
  deleteFriend,
  acceptRequest
}) => {
  const [loading, setLoading] = useState(refreshing);
  const ref = React.createRef<TransitioningView>();

  const getState = () => {
    const { friends } = currentUser;

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

  useEffect(() => {
    if (loading) {
      ref.current?.animateNextTransition();
      setLoading(false);
    }
  }, [getState(), error]);

  const title = (state: ReturnType<typeof getState>) => {
    switch (state) {
      case "friends":
        return "friends";
      case "requested":
        return "requested";
      case "none":
        return "add friend";
      default:
        return "";
    }
  };

  const action = (state: ReturnType<typeof getState>) => {
    switch (state) {
      case "friends":
        return () => deleteFriend(user.phoneNumber);
      case "requested":
        return () => cancelRequest(user.phoneNumber);
      case "none":
        return () => sendFriendRequest(user.phoneNumber);
      default:
        return () => {};
    }
  };

  const onPressWrapper = (fn: () => void) => () => {
    fn();
    setLoading(true);
    ref.current?.animateNextTransition();
  };

  const renderButton = () => {
    const state = getState();

    if (state !== "received") {
      const icon =
        state === "none" ? (
          <AddFriendSVG width={ICON_SIZE} height={ICON_SIZE} />
        ) : state === "friends" ? (
          <CheckSVG width={ICON_SIZE} height={ICON_SIZE} />
        ) : (
          <PendingFriendSVG width={ICON_SIZE} height={ICON_SIZE} />
        );

      return (
        <View style={styles.container}>
          {showLabel ? (
            <Text style={[styles.label]}>{title(state)}</Text>
          ) : null}
          <TouchableOpacity onPress={onPressWrapper(action(state))}>
            {icon}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {showLabel ? (
          <Text
            style={[styles.label]}
          >{`${user.firstName} sent you a request`}</Text>
        ) : null}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onPressWrapper(() => acceptRequest(user.phoneNumber))}
          >
            <CheckSVG width={ICON_SIZE} height={ICON_SIZE} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={onPressWrapper(() => denyRequest(user.phoneNumber))}
          >
            <DenySVG width={ICON_SIZE} height={ICON_SIZE} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const transition = (
    <Transition.Together>
      <Transition.In type="fade" />
      <Transition.Out type="fade" />
      <Transition.Change interpolation="easeInOut" />
    </Transition.Together>
  );

  if (user.phoneNumber !== currentUser.phoneNumber)
    return (
      <Transitioning.View
        ref={ref}
        transition={transition}
        style={styles.transitioningView}
      >
        {loading ? (
          <ActivityIndicator style={{ height: ICON_SIZE }} size={"large"} />
        ) : (
          renderButton()
        )}
      </Transitioning.View>
    );
  else return null;
};

const styles = StyleSheet.create({
  transitioningView: {
    flex: 1,
    alignItems: "flex-end"
  },
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row"
  },
  label: {
    ...TextStyles.small,
    marginRight: 10
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(FriendButton);
