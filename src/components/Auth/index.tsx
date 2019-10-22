import React from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { connect } from "react-redux";

import { withApi, ApiProps } from "@api";
import { AuthState as AuthStateType, AppState as AppStateType } from "@redux/types";
import { Actions } from "@redux/auth";

export interface AuthReduxProps {
  requestAuth: typeof Actions.requestAuth;
  checkCode: typeof Actions.checkCode;
}
export interface AuthOwnProps extends ApiProps {}
export type AuthProps = AuthReduxProps & AuthOwnProps & AuthStateType;
class Auth extends React.Component<AuthProps> {
  state = {
    phoneNumber: "",
    code: ""
  };

  textAuthenticationCode = () => {
    const { requestAuth } = this.props;
    const { phoneNumber } = this.state;

    requestAuth(phoneNumber);
  };

  checkVerificationCode = () => {
    const { checkCode } = this.props;
    const { phoneNumber, code } = this.state;

    checkCode(phoneNumber, code);
  };

  render() {
    const { loading, isAwaitingCode, authError } = this.props;
    const { phoneNumber, code } = this.state;

    return (
      <View style={styles.container}>
        <Text>Auth page!</Text>
        {loading ? <Text>loading!!</Text> : null}
        {isAwaitingCode ? <Text>code sent!</Text> : null}
        <TextInput
          style={styles.textInput}
          placeholder="phonenumber"
          value={phoneNumber}
          onChange={({ nativeEvent: { text } }) => this.setState({ phoneNumber: text })}
        />
        <TextInput
          style={styles.textInput}
          placeholder="code"
          value={code}
          onChange={({ nativeEvent: { text } }) => this.setState({ code: text })}
        />
        <Button
          title={isAwaitingCode ? "verify code" : "send text message"}
          onPress={isAwaitingCode ? this.checkVerificationCode : this.textAuthenticationCode}
        />
        {authError && <Text>{authError}</Text>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  textInput: {
    marginVertical: 10,
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.1)",
    width: 300,
    height: 30
  }
});

const mapStateToProps = ({ auth }: AppStateType, ownProps: AuthOwnProps) => ({
  ...auth,
  ...ownProps
});
const mapDispatchToProps = {
  ...Actions
};

export default withApi(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Auth)
);
