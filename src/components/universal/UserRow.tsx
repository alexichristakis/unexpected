import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { TextStyles } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";
import { Button } from "./Button";
import UserImage from "./UserImage";
import FriendButton from "./FriendButton";

export interface UserRowProps {
  actions?: Array<{ title: string; onPress: () => void }>;
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
        <Button
          size="small"
          key={title}
          style={styles.button}
          title={title}
          onPress={onPress}
        />
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
