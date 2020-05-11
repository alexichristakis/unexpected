export { default as PostModal } from "./PostModal";
export { default as UserModal } from "./UserModal";
// export { default as Header } from "./Header";
// export * from "../Feed/Posts";

import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import Animated from "react-native-reanimated";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PostActions, UserActions } from "@redux/modules";

import Header from "./Header";
import Grid from "../Grid";
import { SB_HEIGHT, Colors } from "@lib";

const connector = connect(
  (state: RootState, props: ProfileProps) => ({
    postIds: selectors.usersPosts(state, props),
  }),
  {
    fetchPosts: PostActions.fetchUsersPosts,
    fetchUser: UserActions.fetchUser,
  }
);

export interface ProfileProps {
  userId: string;
}

export type ProfileConnectedProps = ConnectedProps<typeof connector>;

const Profile: React.FC<ProfileProps & ProfileConnectedProps> = ({
  fetchPosts,
  fetchUser,
  userId,
  postIds,
}) => {
  useEffect(() => {
    // fetchUser(phoneNumber);
    // fetchPosts(phoneNumber);
  }, []);

  const renderHeader = () => <Header id={userId} />;

  // return null;
  return <Grid {...{ userId, renderHeader }} />;

  // return (
  //   <Animated.ScrollView
  //     style={{
  //       flex: 1,
  //       paddingTop: SB_HEIGHT,
  //       backgroundColor: Colors.background,
  //     }}
  //     contentContainerStyle={{
  //       alignItems: "center",
  //       justifyContent: "center",
  //       paddingBottom: 100,
  //     }}
  //   >
  //     <Header />
  //     <Grid
  //       phoneNumber={phoneNumber}
  //       postIds={postIds}
  //       // onPressPost={handleOnPressPost}
  //       // scrollY={scrollY}
  //       // friendStatus={getFriendStatusState()}
  //       // onScrollEndDrag={handleOnScrollEndDrag}
  //       // headerContainerStyle={styles.headerContainer}
  //     />
  //   </Animated.ScrollView>
  // );
};

export default connector(Profile);
