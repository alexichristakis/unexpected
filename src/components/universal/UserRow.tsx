import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import UserImage from "./UserImage";
import { UserType } from "unexpected-cloud/models/user";
import { TextStyles } from "@lib/styles";
import { Button } from "./Button";

export interface UserRowProps {
  actions?: { title: string; onPress: () => void }[];
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
      <View style={{ flex: 1 }} />
      {actions.map(({ title, onPress }) => (
        <Button style={styles.button} title={title} onPress={onPress} />
      ))}
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
  button: {
    marginLeft: 10
  },
  name: {
    ...TextStyles.medium,
    marginLeft: 10
  }
});
