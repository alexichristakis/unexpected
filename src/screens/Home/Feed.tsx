import { useNavigation } from "@react-navigation/core";
import { useFocusEffect, useIsFocused } from "@react-navigation/core";
import React, { useCallback } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Contacts from "react-native-contacts";
import { Screen, ScreenProps } from "react-native-screens";
import { connect } from "react-redux";

import { Posts } from "@components/Profile";
import { UserImage } from "@components/universal";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as ImageActions } from "@redux/modules/image";
import {
  Actions as PermissionsActions,
  Permissions
} from "@redux/modules/permissions";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { routes } from "../index";

const mapStateToProps = (state: RootState) => ({
  feed: selectors.feedState(state)
});
const mapDispatchToProps = {
  fetchFeed: PostActions.fetchFeed,
  logout: AuthActions.logout,
  requestNotificationPermissions: PermissionsActions.requestNotifications,
  requestPermission: PermissionsActions.requestPermission,
  uploadPhoto: ImageActions.uploadPhoto
};

export type FeedReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface FeedOwnProps {}
export type FeedProps = FeedReduxProps & FeedOwnProps;

export const Feed: React.FC<FeedProps> = React.memo(
  ({
    feed,
    fetchFeed,
    requestNotificationPermissions,
    requestPermission,
    uploadPhoto,
    logout
  }) => {
    const navigation = useNavigation();

    useFocusEffect(
      useCallback(() => {
        if (feed.stale) fetchFeed();
      }, [feed.stale])
    );

    const getContacts = () => {
      Contacts.getAllWithoutPhotos((err, contacts) => {
        console.log(contacts);
      });
    };

    const getPosts = () => {
      return feed.posts;
    };

    return (
      <Screen style={styles.container}>
        <Button
          title="permissions"
          onPress={() => navigation.navigate(routes.Permissions)}
        />
        <Posts posts={getPosts()} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100
    // justifyContent: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
