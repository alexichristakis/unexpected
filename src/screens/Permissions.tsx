import React, { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

import { useIsFocused } from "@react-navigation/core";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Button } from "@components/universal";
import { SCREEN_HEIGHT, TextStyles } from "@lib/styles";
import {
  Actions as PermissionsActions,
  Permissions as PermissionTypes
} from "@redux/modules/permissions";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

const mapStateToProps = (state: RootState) => ({
  ...selectors.permissions(state)
});
const mapDispatchToProps = {
  requestNotifications: PermissionsActions.requestNotifications,
  request: PermissionsActions.requestPermission
};

export type PermissionsReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface PermissionsOwnProps {}
export type PermissionsProps = PermissionsOwnProps & PermissionsReduxProps;

const Permissions: React.FC<PermissionsProps> = React.memo(
  ({
    request,
    requestNotifications,
    notifications,
    camera,
    location,
    contacts
  }) => {
    const isFocused = useIsFocused();

    useEffect(() => {
      if (isFocused) StatusBar.setBarStyle("light-content", true);
      else StatusBar.setBarStyle("dark-content", true);
    }, [isFocused]);

    return (
      <Screen style={styles.container}>
        <Text style={TextStyles.medium}>
          we need your permission for a couple of things.
        </Text>
        <View style={styles.table}>
          <View style={styles.left}>
            <Text style={TextStyles.small}>
              notifications are needed so you know when you can post
            </Text>
            <Text style={TextStyles.small}>
              the camera is needed so you can take photos
            </Text>
            <Text style={TextStyles.small}>
              contacts are helpful so that you can find your friends
            </Text>
            <Text style={TextStyles.small}>
              location is helpful so that you dont need to set your timezone
            </Text>
          </View>
          <View style={styles.right}>
            <Button
              size="small"
              title="notifications"
              onPress={requestNotifications}
            />
            <Button
              size="small"
              title="camera"
              onPress={() => request(PermissionTypes.CAMERA)}
            />
            <Button
              size="small"
              title="contacts"
              onPress={() => request(PermissionTypes.CONTACTS)}
            />
            <Button
              size="small"
              title="location"
              onPress={() => request(PermissionTypes.LOCATION)}
            />
          </View>
        </View>
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center"
  },
  table: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT / 2,
    alignSelf: "stretch",
    flexDirection: "row"
  },
  left: {
    flex: 2,
    paddingRight: 20,
    alignSelf: "stretch",
    justifyContent: "space-around"
  },
  right: {
    flex: 1.5,
    alignSelf: "stretch",
    justifyContent: "space-around"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Permissions);
