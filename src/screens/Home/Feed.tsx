import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Contacts from "react-native-contacts";
import { Screen, ScreenProps } from "react-native-screens";
import { connect } from "react-redux";

import { UserImage } from "@components/universal";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PermissionsActions, Permissions } from "@redux/modules/permissions";
import { ReduxPropsType, RootState } from "@redux/types";
import { routes } from "../index";

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  requestNotificationPermissions: PermissionsActions.requestNotifications,
  requestPermission: PermissionsActions.requestPermission,
  uploadPhoto: ImageActions.uploadPhoto
};

export type FeedReduxProps = ReduxPropsType<typeof mapStateToProps, typeof mapDispatchToProps>;
export interface FeedOwnProps {}
export type FeedProps = FeedReduxProps & FeedOwnProps;

export const Feed: React.FC<FeedProps> = React.memo(
  ({ requestNotificationPermissions, requestPermission, uploadPhoto, logout }) => {
    const navigation = useNavigation();

    const getContacts = () => {
      Contacts.getAllWithoutPhotos((err, contacts) => {
        console.log(contacts);
      });
    };

    return (
      <Screen style={styles.container}>
        <Text>Feed page!</Text>
        <UserImage size={60} phoneNumber={"2069409629"} />
        <Button title="push profile screen" onPress={() => navigation.navigate(routes.Profile)} />
        <Button title="upload profile picture" onPress={() => uploadPhoto()} />
        <Button title="upload photo" onPress={() => uploadPhoto("some id")} />
        <Button
          title="request camera permissions"
          onPress={() => requestPermission(Permissions.CAMERA)}
        />
        <Button
          title="request contact permissions"
          onPress={() => requestPermission(Permissions.CONTACTS)}
        />
        <Button title="push post screen" onPress={() => navigation.navigate(routes.Post)} />

        <Button title="request notifications" onPress={requestNotificationPermissions} />
        <Button title="logout" onPress={logout} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
    // justifyContent: "center"
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed);
