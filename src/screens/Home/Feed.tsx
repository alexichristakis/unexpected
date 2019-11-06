import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { Screen, ScreenProps } from "react-native-screens";
import { connect } from "react-redux";
import Contacts from "react-native-contacts";
import uuid from "uuid/v4";

import { ReduxType } from "@lib/types";
import { UserImage } from "@components/universal";
import { Actions as AppActions } from "@redux/modules/app";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PermissionsActions, Permissions } from "@redux/modules/permissions";
import { Actions as ImageActions } from "@redux/modules/image";
import { RootState } from "@redux/types";

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {
  navigate: AppActions.navigate,
  logout: AuthActions.logout,
  requestNotificationPermissions: PermissionsActions.requestNotifications,
  requestPermission: PermissionsActions.requestPermission,
  uploadPhoto: ImageActions.onUploadPhoto
};

export type FeedReduxProps = ReduxType<typeof mapStateToProps, typeof mapDispatchToProps>;
export interface FeedProps extends ScreenProps {}
const Feed: React.FC<FeedProps & FeedReduxProps & NavigationInjectedProps> = ({
  requestNotificationPermissions,
  requestPermission,
  uploadPhoto,
  navigate,
  logout,
  active,
  style
}) => {
  const getContacts = () => {
    Contacts.getAllWithoutPhotos((err, contacts) => {
      console.log(contacts);
    });
  };

  return (
    <Screen active={active} style={[style, styles.container]}>
      <Text>Feed page!</Text>
      <UserImage size={60} phoneNumber={"2069409629"} />
      <Button title="push profile screen" onPress={() => navigate("Profile")} />
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
      <Button title="push capture screen" onPress={() => navigate("Capture")} />
      <Button title="push post screen" onPress={() => navigate("Post")} />

      <Button title="request notifications" onPress={requestNotificationPermissions} />
      <Button title="logout" onPress={logout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
    // justifyContent: "center"
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed);
