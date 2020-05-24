import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";

import { Colors, formatName, TextStyles } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import FriendButton from "./FriendButton";
import UserImage from "./UserImage";
import { useNavigation } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "App";

const connector = connect(
  (state: RootState, props: UserRowProps) => ({
    user: selectors.user(state, props),
  }),
  {}
);

export type UserRowStyle = "light" | "card" | "default";

export interface UserRowProps {
  id: string;
  card?: boolean;
  style: UserRowStyle;
  onPress: (id: string) => void;
}

export type UserRowConnectedProps = ConnectedProps<typeof connector>;

const UserRow: React.FC<UserRowProps & UserRowConnectedProps> = ({
  id,
  user,
  style = "default",
  card = false,
  onPress,
}) => {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  const handleOnPress = () => {
    navigation.navigate("PROFILE", { id });
  };

  const additionalStyle = style === "card" ? styles.card : {};

  const additionalTextSTyle = style === "light" ? styles.light : {};

  return (
    <TouchableHighlight
      underlayColor={style === "light" ? Colors.transGray : Colors.gray}
      onPress={handleOnPress}
      style={[styles.container, additionalStyle]}
    >
      <>
        <UserImage id={id} size={35} />
        <Text style={{ ...styles.name, ...additionalTextSTyle }}>
          {formatName(user)}
        </Text>
        <View style={styles.buttonContainer}>
          <FriendButton light={style === "light"} {...{ id }} />
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
  light: {
    color: Colors.lightGray,
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
