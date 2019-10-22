import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { connect } from "react-redux";

import { withApi, ApiProps } from "@api";
import { Actions } from "@redux/auth";

export interface HomeReduxProps {
  logout: typeof Actions.logout;
}
export interface HomeProps extends ApiProps {}
class Home extends React.Component<HomeProps & HomeReduxProps> {
  state = {};

  handleOnPress = () => {
    const { api } = this.props;
    api.testAuthenticated();
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>home page!</Text>
        <Button title="test request that needs authorization" onPress={this.handleOnPress} />
        <Button title="logout" onPress={this.props.logout} />
      </View>
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
const mapDispatchToProps = { logout: Actions.logout };

export default withApi(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Home)
);
