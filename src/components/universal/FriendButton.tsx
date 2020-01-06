import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { connect } from "react-redux";
import { UserType } from "unexpected-cloud/models/user";
import Animated, {
  Transition,
  Transitioning,
  TransitioningView
} from "react-native-reanimated";

/* some svgs */
import AddFriendSVG from "@assets/svg/plus_button.svg";
import PendingFriendSVG from "@assets/svg/arrow_button.svg";
import FriendSVG from "@assets/svg/check_button.svg";
import DenySVG from "@assets/svg/cancel_button.svg";

import { TextSizes, TextStyles } from "@lib/styles";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

const ICON_SIZE = 40;

export interface FriendButtonProps {
  user: UserType;
  circle?: boolean;
  showLabel?: boolean;
  size?: TextSizes;
  style?: ViewStyle;
}

const mapStateToProps = (state: RootState, props: FriendButtonProps) => ({
  currentUser: selectors.currentUser(state)
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

const FriendButton: React.FC<FriendButtonProps & FriendButtonReduxProps> = ({
  style,
  circle,
  showLabel,
  user,
  currentUser,
  sendFriendRequest,
  cancelFriendRequest,
  deleteFriend,
  acceptRequest,
  denyRequest
}) => {
  const [loading, setLoading] = useState(false);
  const ref = React.createRef<TransitioningView>();

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

  useEffect(() => {
    if (loading) {
      ref.current?.animateNextTransition();
      setLoading(false);
    }
  }, [getState()]);

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
        return () => deleteFriend(user);
      case "requested":
        return () => cancelFriendRequest(user);
      case "none":
        return () => sendFriendRequest(user);
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
          <FriendSVG width={ICON_SIZE} height={ICON_SIZE} />
        ) : (
          <PendingFriendSVG width={ICON_SIZE} height={ICON_SIZE} />
        );

      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center"
          }}
        >
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onPressWrapper(() => acceptRequest(user))}>
          <FriendSVG width={ICON_SIZE} height={ICON_SIZE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={onPressWrapper(() => denyRequest(user))}
        >
          <DenySVG width={ICON_SIZE} height={ICON_SIZE} />
        </TouchableOpacity>
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

  return (
    <Transitioning.View
      ref={ref}
      transition={transition}
      style={{ flex: 1, alignItems: "flex-end" }}
    >
      {loading ? (
        <ActivityIndicator style={{ height: ICON_SIZE }} size={"large"} />
      ) : (
        renderButton()
      )}
    </Transitioning.View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: "row"
  },
  label: {
    ...TextStyles.small,
    marginRight: 10
  },
  button: {
    flex: 1
    // alignSelf: "stretch"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FriendButton);
