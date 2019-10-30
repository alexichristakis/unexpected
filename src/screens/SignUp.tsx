import React from "react";
import { StyleSheet, Platform, Text, Button } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { AppState as AppStateType } from "@redux/types";
import { Actions, UserState as UserStateType } from "@redux/modules/user";
import { Input } from "@components/universal";

export interface AuthReduxProps {
  createUser: typeof Actions.createUser;
}
export interface SignUpOwnProps {
  //
}
export type AuthProps = AuthReduxProps & SignUpOwnProps & UserStateType;
class SignUp extends React.Component<AuthProps> {
  state = {
    firstName: "",
    lastName: ""
  };

  componentDidMount() {}

  createUser = () => {
    const { firstName, lastName } = this.state;
    const { createUser } = this.props;

    createUser({ firstName, lastName });
  };

  render() {
    const { loading, error } = this.props;
    const { firstName, lastName } = this.state;

    return (
      <Screen style={styles.container}>
        <Text>sign up page!</Text>
        {loading ? <Text>loading!!</Text> : null}
        <Input
          placeholder="first name"
          value={firstName}
          onChange={({ nativeEvent: { text } }) => this.setState({ firstName: text })}
        />
        <Input
          placeholder="last name"
          value={lastName}
          onChange={({ nativeEvent: { text } }) => this.setState({ lastName: text })}
        />
        <Button title={"create user"} onPress={this.createUser} />
        {error && <Text>{error}</Text>}
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

const mapStateToProps = ({ user }: AppStateType, ownProps: SignUpOwnProps) => ({
  ...user,
  ...ownProps
});
const mapDispatchToProps = {
  ...Actions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp);
