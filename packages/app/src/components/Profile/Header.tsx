import React, { useCallback, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { Button, PullToRefresh, UserImage } from "@components/universal";
import { FriendsContext } from "@hooks";
import { Colors, SCREEN_WIDTH, TextStyles } from "@lib";
import { useNavigation } from "@react-navigation/core";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

const connector = connect(
  (state: RootState, props: HeaderProps) => ({
    // isUser,
    user: selectors.user(state, props),
    numPosts: selectors.numPosts(state, props),
    numFriends: selectors.numFriends(state, props),
    // friendRequests: isUser ? selectors.friendRequestNumbers(state) : null,
  }),
  {}
);

export type HeaderConnectedProps = ConnectedProps<typeof connector>;

export interface HeaderProps {
  id: string;
}

export const Header: React.FC<HeaderProps & HeaderConnectedProps> = ({
  id,
  user,
  numPosts,
  numFriends,
}) => {
  const { firstName, lastName, bio = "" } = user;

  const { open: openFriends } = useContext(FriendsContext);

  const navigation = useNavigation();

  const onPressAddBio = () => {};

  const handleOnPressFriends = useCallback(() => {
    // openFriends(id);
    navigation.navigate("FRIENDS", { id });
  }, [id]);

  return (
    <Animated.View style={styles.container}>
      <View style={styles.row}>
        <UserImage id={id} size={(SCREEN_WIDTH - 60) / 2} />
        <View
          style={{
            ...styles.row,
            alignSelf: "center",
            justifyContent: "space-around",
          }}
        >
          <Text
            style={{ ...styles.subheader, textAlign: "center" }}
            numberOfLines={2}
          >{`${numPosts}\n${numPosts === 1 ? "post" : "posts"}`}</Text>
          <View style={styles.divider} />
          <Text
            style={{ ...styles.subheader, textAlign: "center" }}
            onPress={handleOnPressFriends}
          >{`${numFriends}\n${numFriends === 1 ? "friend" : "friends"}`}</Text>
        </View>
      </View>

      <View style={{ paddingTop: 25, alignSelf: "flex-start" }}>
        <Text style={TextStyles.title}>{`${firstName} ${lastName}`}</Text>
        {bio.length || !onPressAddBio ? (
          <Text style={styles.bioText}>{bio}</Text>
        ) : (
          <Button white={true} title="add a bio" onPress={onPressAddBio} />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    flex: 1,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 50,
    backgroundColor: Colors.gray,
  },
  subheader: {
    ...TextStyles.large,
    color: Colors.nearBlack,
  },
  loaderContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: "center",
  },
  row: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  notificationIndicator: {
    marginLeft: 10,
    height: 30,
    width: 30,
    borderRadius: 15,
    padding: 5,
    backgroundColor: Colors.pink,
    justifyContent: "center",
    alignItems: "center",
  },
  bioText: {
    ...TextStyles.medium,
  },
  header: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: "center",
  },
});

export default connector(Header);
