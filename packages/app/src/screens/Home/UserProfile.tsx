import React, { useCallback, useState, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  FlatList,
  View,
  Text,
  ScrollView,
  ListRenderItem,
  ListRenderItemInfo
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { useScrollToTop } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import isEqual from "lodash/isEqual";
import Haptics from "react-native-haptic-feedback";
import Animated, { Easing, useCode } from "react-native-reanimated";
import { useValues } from "react-native-redash";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";
import uuid from "uuid/v4";

import { hideStatusBarOnScroll } from "@hooks";
import { UserModal, Top, Grid } from "@components/Profile";
import { ModalListRef } from "@components/universal";
import { SB_HEIGHT } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Post, User } from "@unexpected/global";

import { StackParamList } from "../../App";

const mapStateToProps = (state: RootState, props: UserProfileOwnProps) => ({
  user: selectors.currentUser(state),
  stale: selectors.feedStale(state),
  // @ts-ignore
  friends: selectors.friends(state),
  friendRequests: selectors.friendRequests(state)
});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  fetchUser: UserActions.fetchUser,
  fetchUsersRequests: UserActions.fetchUsersRequests,
  fetchUsersPosts: PostActions.fetchUsersPosts
};

export type UserProfileReduxProps = ConnectedProps<typeof connector>;

export interface UserProfileOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "USER_PROFILE">;
  route: RouteProp<StackParamList, "USER_PROFILE">;
}

export type UserProfileProps = UserProfileOwnProps & UserProfileReduxProps;
export const UserProfile: React.FC<UserProfileProps> = React.memo(
  ({
    navigation,
    fetchUser,
    fetchUsersRequests,
    fetchUsersPosts,
    friendRequests,
    friends,
    stale,
    user
  }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const [modalType, setModalType] = useState<"friends" | "requests">(
      "friends"
    );

    const scrollRef = useRef<FlatList>(null);
    const modalRef = useRef<ModalListRef>(null);

    const animatedStatusBarStyle = hideStatusBarOnScroll(scrollY);

    // @ts-ignore
    useScrollToTop(scrollRef);

    useFocusEffect(
      useCallback(() => {
        fetchUser();
        fetchUsersRequests();

        if (stale) fetchUsersPosts();

        return () => {};
      }, [stale])
    );

    const goToNewProfilePicture = () =>
      navigation.navigate("NEW_PROFILE_PICTURE");

    const goToSettings = () => navigation.navigate("SETTINGS");

    // const goToFriends = () => navigation.navigate("FRIENDS", { user });
    const openFriends = () => {
      modalRef.current?.open();
      setModalType("friends");
    };

    const goToEditProfile = () => navigation.navigate("EDIT_PROFILE");

    const openRequests = () => {
      modalRef.current?.open();
      setModalType("requests");
    };

    const renderTop = () => (
      <Top
        phoneNumber={user.phoneNumber}
        scrollY={scrollY}
        onPressAddBio={goToEditProfile}
        onPressFriends={openFriends}
        onPressImage={goToNewProfilePicture}
        onPressFriendRequests={openRequests}
        onPressSettings={goToSettings}
      />
    );

    const handleOnPressUser = (toUser: User) => {
      if (user.phoneNumber === toUser.phoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: {
            prevRoute: user.firstName,
            phoneNumber: toUser.phoneNumber
          }
        });
      }
    };

    const handleOnPressPost = (post: Post) => {
      navigation.navigate({
        name: "POST",
        key: uuid(),
        params: { prevRoute: user.firstName, postId: post.id }
      });
    };

    const handleOnScrollEndDrag = (
      event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
      const {
        nativeEvent: {
          contentOffset: { y }
        }
      } = event;

      if (y < -100) {
        Haptics.trigger("impactMedium");
        fetchUser();
        fetchUsersRequests();
        fetchUsersPosts();
      }
    };

    return (
      <Screen style={styles.container}>
        <Grid
          scrollRef={scrollRef}
          scrollY={scrollY}
          onPressPost={handleOnPressPost}
          onScrollEndDrag={handleOnScrollEndDrag}
          headerContainerStyle={styles.headerContainer}
          renderHeader={renderTop}
        />
        <Animated.View style={[styles.statusBar, animatedStatusBarStyle]} />
        <UserModal
          modalRef={modalRef}
          type={modalType}
          data={modalType === "friends" ? friends : friendRequests}
          onPressUser={handleOnPressUser}
        />
      </Screen>
    );
  },
  (prevProps, nextProps) =>
    prevProps.stale === nextProps.stale &&
    isEqual(prevProps.user, nextProps.user)
);

const styles = StyleSheet.create({
  container: {
    // paddingTop: SB_HEIGHT(),
    alignItems: "center"
  },
  headerContainer: {
    zIndex: 1,
    paddingTop: SB_HEIGHT(),
    alignItems: "center",
    alignSelf: "stretch"
  },
  statusBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: SB_HEIGHT(),
    backgroundColor: "white"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(UserProfile);
