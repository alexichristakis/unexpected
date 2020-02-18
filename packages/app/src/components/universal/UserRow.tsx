import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import { Colors, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { User } from "@unexpected/global";

import FriendButton from "./FriendButton";
import UserImage from "./UserImage";

export interface UserRowProps {
  onPress: (user: User) => void;
  user: User;
}

export const UserRow: React.FC<UserRowProps> = ({ user, onPress }) => {
  const handleOnPress = () => {
    onPress(user);
  };

  return (
    <TouchableHighlight
      underlayColor={Colors.lightGray}
      onPress={handleOnPress}
      style={styles.container}
    >
      <>
        <UserImage phoneNumber={user.phoneNumber} size={35} />
        <Text style={styles.name}>{formatName(user)}</Text>
        <View style={styles.buttonContainer}>
          <FriendButton user={user} />
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
    paddingVertical: 10
  },
  buttonContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  name: {
    ...TextStyles.medium,
    marginLeft: 10
  }
});
