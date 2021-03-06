import React, { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

import { useIsFocused } from "@react-navigation/core";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";

import { Button } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { isIPhoneX, SCREEN_HEIGHT, TextStyles } from "@lib";
import {
  Actions as PermissionsActions,
  Permissions as PermissionTypes,
  PermissionType,
} from "@redux/modules/permissions";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "App";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";

const mapStateToProps = (state: RootState) => ({
  ...selectors.permissions(state),
});
const mapDispatchToProps = {
  requestNotifications: PermissionsActions.requestNotifications,
  request: PermissionsActions.requestPermission,
};

export type PermissionsConnectedProps = ConnectedProps<typeof connector>;
export interface PermissionsOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "PERMISSIONS">;
}
export type PermissionsProps = PermissionsOwnProps & PermissionsConnectedProps;

const Permissions: React.FC<PermissionsProps> = React.memo(
  ({
    request,
    requestNotifications,
    navigation,
    notifications,
    camera,
    location,
    contacts,
  }) => {
    useLightStatusBar();

    const handlePressRequest = (key: PermissionType) => () => request(key);

    return (
      <Screen stackPresentation={"modal"} style={styles.container}>
        <View style={styles.table}>
          <Text style={[TextStyles.medium, styles.header]}>
            we need your permission for a couple of things:
          </Text>
          <View style={styles.row}>
            <Text style={[styles.text, TextStyles.small]}>
              notifications are needed so you know when you can post
            </Text>
            <Button
              style={styles.button}
              title="notifications"
              onPress={requestNotifications}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.text, TextStyles.small]}>
              the camera is needed so you can take photos
            </Text>
            <Button
              style={styles.button}
              title="camera"
              onPress={handlePressRequest(PermissionTypes.CAMERA)}
            />
          </View>
          {/* <Text style={[TextStyles.medium, styles.header]}>
            the following are useful but not required:
          </Text>
          <View style={styles.row}>
            <Text style={[styles.text, TextStyles.small]}>
              contacts are helpful so that you can find your friends
            </Text>
            <Button
              style={styles.button}
              title="contacts"
              onPress={() => request(PermissionTypes.CONTACTS)}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.text, TextStyles.small]}>
              location is helpful so that you dont need to set your timezone
            </Text>
            <Button
              style={styles.button}
              title="location"
              onPress={() => request(PermissionTypes.LOCATION)}
            />
          </View> */}
        </View>
        <Button title="dismiss" onPress={navigation.goBack} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: isIPhoneX ? 50 : 20,
    justifyContent: "space-between",
    // alignItems: "center"
  },
  table: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT / 2,
    alignSelf: "stretch",
  },
  header: {
    marginBottom: 40,
  },
  text: {
    flex: 2,
    marginRight: 20,
  },
  button: {
    flex: 1.5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 40,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Permissions);
