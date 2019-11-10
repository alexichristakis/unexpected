import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Actions } from "@redux/modules/auth";

export interface ProfileReduxProps {
  // logout: typeof Actions.logout;
}
export interface ProfileProps {}
class Profile extends React.Component<ProfileProps & ProfileReduxProps> {
  state = {};

  render() {
    return (
      <Screen style={styles.container}>
        <Text>Profile page!</Text>
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
const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
