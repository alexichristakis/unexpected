import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";

import { Colors, formatName, TextStyles } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import FriendButton from "./FriendButton";
import UserImage from "./UserImage";

const connector = connect(
  (state: RootState, props: UserRowProps) => ({
    user: selectors.user(state, props),
  }),
  {}
);

export interface UserRowProps {
  id: string;
  card?: boolean;
  onPress: (id: string) => void;
}

export type UserRowConnectedProps = ConnectedProps<typeof connector>;

const UserRow: React.FC<UserRowProps & UserRowConnectedProps> = ({
  id,
  user,
  card = false,
  onPress,
}) => {
  const handleOnPress = () => {
    onPress(id);
  };

  return (
    <TouchableHighlight
      underlayColor={Colors.lightGray}
      onPress={handleOnPress}
      style={[styles.container, card ? styles.card : {}]}
    >
      <>
        <UserImage id={id} size={35} />
        <Text style={styles.name}>{formatName(user)}</Text>
        <View style={styles.buttonContainer}>
          <FriendButton {...{ id }} />
        </View>
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  name: {
    ...TextStyles.medium,
    marginLeft: 10,
  },
});

export default connector(UserRow);
