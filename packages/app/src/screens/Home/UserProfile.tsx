import React, { useCallback, useState, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  FlatList
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { useScrollToTop } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import isEqual from "lodash/isEqual";
import Haptics from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";

import { hideStatusBarOnScroll } from "@hooks";
import { UserModal, Top, Grid, PostModal } from "@components/Profile";
import { ModalListRef } from "@components/universal";
import { SB_HEIGHT } from "@lib/styles";
import { AuthActions, PostActions, UserActions } from "@redux/modules";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Post } from "@unexpected/global";

import { ParamList } from "../../App";

const mapStateToProps = (state: RootState) => ({
  user: selectors.currentUser(state),
  stale: selectors.feedStale(state)
});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  fetchUser: UserActions.fetchUser,
  fetchUsersRequests: UserActions.fetchUsersRequests,
  fetchUsersPosts: PostActions.fetchUsersPosts
};

export type UserProfileReduxProps = ConnectedProps<typeof connector>;

export interface UserProfileOwnProps {
  navigation: NativeStackNavigationProp<ParamList, "USER_PROFILE">;
  route: RouteProp<ParamList, "USER_PROFILE">;
}

export type UserProfileProps = UserProfileOwnProps & UserProfileReduxProps;
export const UserProfile: React.FC<UserProfileProps> = React.memo(
  ({
    navigation,
    fetchUser,
    fetchUsersRequests,
    fetchUsersPosts,
    stale,
    user,
    route
  }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const [modalType, setModalType] = useState<
      "friends" | "requests" | undefined
    >(undefined);
    const [focusedPostId, setFocusedPostId] = useState("");

    const scrollRef = useRef<FlatList>(null);
    const modalRef = useRef<ModalListRef>(null);

    const StatusBar = hideStatusBarOnScroll(scrollY, "dark-content");

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

    const goToEditProfile = () => navigation.navigate("EDIT_PROFILE");

    const openFriends = () => {
      modalRef.current?.open();
      setModalType("friends");
    };

    const openRequests = () => {
      modalRef.current?.open();
      setModalType("requests");
    };

    const handleOnPressPost = ({ id }: Post) => {
      requestAnimationFrame(() => setFocusedPostId(id));
    };

    const handlePostModalClose = () => setFocusedPostId("");
    const handleUserModalClose = () => setModalType(undefined);

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
        <StatusBar />
        <UserModal
          visible={!!modalType}
          type={modalType}
          phoneNumber={user.phoneNumber}
          onClose={handleUserModalClose}
        />
        <PostModal
          postId={
            route.params?.focusedPostId.length
              ? route.params?.focusedPostId
              : focusedPostId
          }
          onClose={handlePostModalClose}
        />
      </Screen>
    );
  },
  (prevProps, nextProps) =>
    prevProps.stale === nextProps.stale &&
    prevProps.route.params?.focusedPostId ===
      nextProps.route.params?.focusedPostId &&
    isEqual(prevProps.user, nextProps.user)
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  headerContainer: {
    zIndex: 1,
    paddingTop: SB_HEIGHT,
    alignItems: "center",
    alignSelf: "stretch"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(UserProfile);
