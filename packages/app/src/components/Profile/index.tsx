export { default as PostModal } from "./PostModal";
export { default as UserModal } from "./UserModal";
export { default as Header } from "./Header";
// export * from "../Feed/Posts";

import React from "react";
import { View, Text } from "react-native";

const Profile = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>PROFILE!</Text>
    </View>
  );
};

export default Profile;
