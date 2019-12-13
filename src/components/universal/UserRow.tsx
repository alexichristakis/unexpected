import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { TextStyles } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";
import { Button } from "./Button";
import UserImage from "./UserImage";
import FriendButton from "./FriendButton";

export interface UserRowProps {
  // actions?: Array<{ title: string; onPress: () => void }>;
  actions?: JSX.Element[];
  onPress: (user: UserType) => void;
  user: UserType;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  onPress,
  actions = []
}) => {
  const handleOnPress = () => {
    onPress(user);
  };

  return (
    <TouchableOpacity onPress={handleOnPress} style={styles.container}>
      <UserImage phoneNumber={user.phoneNumber} size={40} />
      <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
      <View style={styles.buttonContainer}>
        {actions.map(action => action)}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 10
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  name: {
    ...TextStyles.medium,
    marginLeft: 10
  }
});
