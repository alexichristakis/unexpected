import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import UserImage from "./UserImage";
import { UserType } from "unexpected-cloud/models/user";
import { TextStyles } from "@lib/styles";

export interface UserRowProps {
  onPress: (user: UserType) => void;
  user: UserType;
}

export const UserRow: React.FC<UserRowProps> = ({ user, onPress }) => {
  const handleOnPress = () => {
    onPress(user);
  };

  return (
    <TouchableOpacity onPress={handleOnPress} style={styles.container}>
      <UserImage phoneNumber={user.phoneNumber} size={40} />
      <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
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
  name: {
    ...TextStyles.medium,
    marginLeft: 10
  }
});
