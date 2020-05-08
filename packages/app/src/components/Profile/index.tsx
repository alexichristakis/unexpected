export { default as PostModal } from "./PostModal";
export { default as UserModal } from "./UserModal";
export { default as Header } from "./Header";
// export * from "../Feed/Posts";

import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PostActions, UserActions } from "@redux/modules";

const connector = connect(
  (state: RootState) => ({
    phoneNumber: selectors.phoneNumber(state),
  }),
  {
    fetchPosts: PostActions.fetchUsersPosts,
    fetchUser: UserActions.fetchUser,
  }
);

export interface ProfileProps {}

export type ProfileConnectedProps = ConnectedProps<typeof connector>;

const Profile: React.FC<ProfileProps & ProfileConnectedProps> = ({
  phoneNumber,
  fetchPosts,
  fetchUser,
}) => {
  useEffect(() => {
    fetchUser(phoneNumber);
    fetchPosts(phoneNumber);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>PROFILE!</Text>
    </View>
  );
};

export default connector(Profile);
