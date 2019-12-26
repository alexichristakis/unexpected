import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { TextStyles } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";
import { Button } from "./Button";
import FriendButton from "./FriendButton";
import UserImage from "./UserImage";
import { formatName } from "@lib/utils";

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
      <Text style={styles.name}>{formatName(user)}</Text>
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
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  name: {
    ...TextStyles.medium,
    marginLeft: 10
  }
});
