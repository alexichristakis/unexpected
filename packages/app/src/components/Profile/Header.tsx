import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import Gear from "@assets/svg/gear.svg";
import { Button, PullToRefresh, UserImage } from "@components/universal";
import { HORIZONTAL_GUTTER } from "@lib";
import { Colors, SCREEN_WIDTH, TextStyles } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

const mapStateToProps = (state: RootState, props: HeaderProps) => {
  const isUser = selectors.phoneNumber(state) === props.phoneNumber;

  return {
    isUser,
    user: selectors.user(state, props),
    numPosts: selectors.usersPostsLength(state, props),
    friendRequests: isUser ? selectors.friendRequestNumbers(state) : null,
  };
};

const mapDispatchToProps = {};

export type HeaderConnectedProps = ConnectedProps<typeof connector>;

export interface HeaderProps {
  uid: string;
  offset: Animated.Value<number>;
}

export const Header: React.FC<HeaderProps & HeaderConnectedProps> = ({
  user,
  numPosts,
}) => {
  const { phoneNumber, firstName, lastName, friends = [], bio = "" } = user;

  const onPressAddBio = () => {};

  return (
    <Animated.View style={[styles.container]}>
      <View style={styles.row}>
        <UserImage phoneNumber={phoneNumber} size={(SCREEN_WIDTH - 60) / 2} />

        <View
          style={{
            ...styles.row,
            alignSelf: "center",
            justifyContent: "space-around",
          }}
        >
          <Text
            testID="num-moments"
            style={{ ...styles.subheader, textAlign: "center" }}
            numberOfLines={2}
          >{`${numPosts}\n${numPosts === 1 ? "post" : "posts"}`}</Text>
          <View
            style={{
              width: StyleSheet.hairlineWidth,
              height: 50,
              backgroundColor: Colors.gray,
            }}
          />
          <Text
            testID="friends"
            style={{ ...styles.subheader, textAlign: "center" }}
            onPress={console.log}
          >{`${friends.length}\n${
            friends.length === 1 ? "friend" : "friends"
          }`}</Text>
        </View>
      </View>

      <View style={{ paddingTop: 10, alignSelf: "flex-start" }}>
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
    paddingTop: 5,
    paddingBottom: 20,
  },
  headerContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Header);
