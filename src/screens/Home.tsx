import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as PermissionsActions, Permissions } from "@redux/modules/permissions";
import { Actions as ImageActions } from "@redux/modules/image";
import { AppState } from "@redux/types";

export interface HomeReduxProps {
  logout: typeof AuthActions.logout;
  requestNotificationPermissions: typeof PermissionsActions.requestNotifications;
  requestPermission: typeof PermissionsActions.requestPermission;
  uploadPhoto: typeof ImageActions.onUploadPhoto;
}
export interface HomeProps {}
class Home extends React.Component<HomeProps & HomeReduxProps & NavigationInjectedProps> {
  state = {};

  requestNotificationPermissions = () => {
    const { requestNotificationPermissions } = this.props;
    requestNotificationPermissions();
  };

  render() {
    const { requestPermission } = this.props;
    return (
      <Screen style={styles.container}>
        <Text>home page!</Text>
        <Button
          title="push profile screen"
          onPress={() => this.props.navigation.navigate({ routeName: "Profile" })}
        />
        <Button title="upload photo" onPress={() => this.props.uploadPhoto()} />
        <Button
          title="request camera permissions"
          onPress={() => requestPermission(Permissions.CAMERA)}
        />
        <Button
          title="push capture screen"
          onPress={() => this.props.navigation.navigate({ routeName: "Capture" })}
        />
        <Button title="request notifications" onPress={this.requestNotificationPermissions} />
        <Button title="logout" onPress={this.props.logout} />
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const mapStateToProps = (state: AppState) => ({});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  requestNotificationPermissions: PermissionsActions.requestNotifications,
  requestPermission: PermissionsActions.requestPermission,
  uploadPhoto: ImageActions.onUploadPhoto
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
