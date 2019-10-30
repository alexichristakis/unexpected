import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { withApi, ApiProps } from "@api";
import { Actions as AuthActions } from "@redux/auth";
import { Actions as PermissionsActions } from "@redux/permissions";

export interface HomeReduxProps {
  logout: typeof AuthActions.logout;
  requestNotificationPermissions: typeof PermissionsActions.requestNotifications;
}
export interface HomeProps extends ApiProps {}
class Home extends React.Component<HomeProps & HomeReduxProps & NavigationInjectedProps> {
  state = {};

  handleOnPress = () => {
    const { api } = this.props;
    api.testAuthenticated();
  };

  requestNotificationPermissions = () => {
    const { requestNotificationPermissions } = this.props;
    requestNotificationPermissions();
  };

  render() {
    return (
      <Screen style={styles.container}>
        <Text>home page!</Text>
        <Button title="test request that needs authorization" onPress={this.handleOnPress} />
        <Button
          title="push profile screen"
          onPress={() => this.props.navigation.navigate({ routeName: "Profile" })}
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

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  requestNotificationPermissions: PermissionsActions.requestNotifications
};

export default withApi(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Home)
);
