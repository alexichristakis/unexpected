import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import Gear from "@assets/svg/gear.svg";
import { Button, PullToRefresh, UserImage } from "@components/universal";
import { HORIZONTAL_GUTTER } from "@lib/constants";
import { Colors, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

const mapStateToProps = (state: RootState, props: ProfileTopProps) => {
  const isUser = selectors.phoneNumber(state) === props.phoneNumber;

  return {
    isUser,
    user: selectors.user(state, props),
    numPosts: selectors.usersPostsLength(state, props),
    friendRequests: isUser ? selectors.friendRequestNumbers(state) : null
  };
};

const mapDispatchToProps = {};

export type ProfileTopConnectedProps = ConnectedProps<typeof connector>;

export interface ProfileTopProps {
  phoneNumber: string;
  scrollY: Animated.Value<number>;
  onPressFriends: () => void;
  onPressImage?: () => void;
  onPressSettings?: () => void;
  onPressFriendRequests?: () => void;
  onPressAddBio?: () => void;
}

export const Top: React.FC<ProfileTopProps & ProfileTopConnectedProps> = ({
  user,
  isUser,
  numPosts,
  scrollY,
  friendRequests,
  onPressFriendRequests,
  onPressAddBio,
  onPressFriends,
  onPressImage,
  onPressSettings
}) => {
  const { phoneNumber, firstName, lastName, friends = [], bio = "" } = user;

  const animatedStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: [-50, 0, 0]
        })
      }
    ]
  };

  const renderNotificationIndicator = () => {
    if (!isUser || !friendRequests?.length) return null;

    return (
      <TouchableOpacity
        onPress={onPressFriendRequests}
        style={styles.notificationIndicator}
      >
        <Text
          testID="notifications"
          style={[TextStyles.medium, { color: "white" }]}
        >
          {friendRequests.length}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeaderButton = () => {
    if (isUser)
      return (
        <TouchableOpacity disabled={!onPressSettings} onPress={onPressSettings}>
          <Gear fill={Colors.nearBlack} width={25} height={25} />
        </TouchableOpacity>
      );
  };

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.headerContainer}>
          <View>
            <View style={styles.headerRow}>
              <Text
                testID="user-name"
                style={TextStyles.title}
              >{`${firstName} ${lastName}`}</Text>
              {renderNotificationIndicator()}
            </View>
            <View style={styles.headerRow}>
              <Text
                testID="num-moments"
                style={styles.subheader}
              >{`${numPosts} ${numPosts === 1 ? "moment" : "moments"}, `}</Text>
              <Text
                testID="friends"
                style={styles.subheader}
                onPress={onPressFriends}
              >{`${friends.length} ${
                friends.length === 1 ? "friend" : "friends"
              }`}</Text>
            </View>
          </View>
          {renderHeaderButton()}
        </View>
        <View style={styles.row}>
          <TouchableOpacity disabled={!onPressImage} onPress={onPressImage}>
            <UserImage
              phoneNumber={phoneNumber}
              size={(SCREEN_WIDTH - 40) / 3}
            />
          </TouchableOpacity>
          <View style={styles.bio}>
            {bio.length || !onPressAddBio ? (
              <Text style={styles.bioText}>{bio}</Text>
            ) : (
              <Button white={true} title="add a bio" onPress={onPressAddBio} />
            )}
          </View>
        </View>
      </Animated.View>
      <PullToRefresh scrollY={scrollY} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 20
  },
  headerContainer: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    marginBottom: 20
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  subheader: {
    ...TextStyles.large,
    color: Colors.nearBlack
  },
  loaderContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: "center"
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    flex: 1
  },
  bio: {
    flex: 1,
    marginLeft: HORIZONTAL_GUTTER
  },
  notificationIndicator: {
    marginLeft: 10,
    height: 30,
    width: 30,
    borderRadius: 15,
    padding: 5,
    backgroundColor: Colors.pink,
    justifyContent: "center",
    alignItems: "center"
  },
  bioText: {
    ...TextStyles.medium,
    flex: 1
  },
  header: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Top);
