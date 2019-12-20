import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Button, FriendButton, UserImage } from "@components/universal";
import { Colors, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";

export interface ProfileTopProps {
  user: UserType;
  isUser?: boolean; // is currently signed in user
  numPosts: number;
  scrollY: Animated.Value;
  onPressFriends: () => void;
  onPressImage?: () => void;
  onPressName?: () => void;
  onPressAddBio?: () => void;
}

export const Top: React.FC<ProfileTopProps> = ({
  user,
  isUser,
  numPosts,
  scrollY,
  onPressAddBio,
  onPressFriends,
  onPressImage,
  onPressName
}) => {
  const {
    phoneNumber,
    firstName,
    lastName,
    friends = [],
    friendRequests = [],
    bio = ""
  } = user;

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

  const animatedHeaderStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 100, 200],
          outputRange: [-200, -100, 100, 200]
        })
      }
    ]
  };

  const renderNotificationIndicator = () => {
    if (!isUser || !friendRequests.length) return null;

    return (
      <View style={styles.notificationIndicator}>
        <Text
          testID="notifications"
          style={[TextStyles.medium, { color: "white" }]}
        >
          {friendRequests.length}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TouchableOpacity
          style={[styles.row, { flexDirection: "column", marginBottom: 20 }]}
          disabled={!onPressName}
          onPress={onPressName}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              testID="user-name"
              style={TextStyles.title}
            >{`${firstName} ${lastName}`}</Text>
            {renderNotificationIndicator()}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              testID="num-moments"
              style={[TextStyles.large]}
            >{`${numPosts} ${numPosts === 1 ? "moment" : "moments"}, `}</Text>
            <Text
              testID="friends"
              style={[TextStyles.large]}
              onPress={onPressFriends}
            >{`${friends.length} ${
              friends.length === 1 ? "friend" : "friends"
            }`}</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.row, { marginBottom: isUser ? 0 : 20 }]}>
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
              <Button title="add a bio" onPress={onPressAddBio} />
            )}
          </View>
        </View>
        {!isUser && <FriendButton showLabel={true} user={user} />}
      </Animated.View>
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <Text style={TextStyles.large}>{`${firstName} ${lastName}`}</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 20
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    flex: 1
  },
  bio: {
    flex: 1,
    marginLeft: 20
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
