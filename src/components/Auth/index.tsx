import React from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { connect } from "react-redux";

import { requestAuthentication, verifyAuthenticationCode } from "@api";
import { AuthState as AuthStateType, AppState as AppStateType } from "@redux/types";
import { Actions } from "@redux/auth";

export interface AuthReduxProps {
  requestAuth: typeof Actions.requestAuth;
  successTextingCode: typeof Actions.successTextingCode;
  errorRequestingAuth: typeof Actions.errorRequestingAuth;
  setJWT: typeof Actions.setJWT;
}
export interface AuthOwnProps {}
class Auth extends React.Component<AuthReduxProps & AuthOwnProps & AuthStateType> {
  state = {
    phoneNumber: "",
    code: ""
  };

  textAuthenticationCode = () => {
    const { requestAuth, successTextingCode, errorRequestingAuth } = this.props;
    const { phoneNumber } = this.state;

    requestAuth();
    requestAuthentication(phoneNumber)
      .then(res => {
        console.log("res:", res);
        successTextingCode();
      })
      .catch(err => {
        errorRequestingAuth(err);
      });
  };

  checkVerificationCode = () => {
    const { requestAuth, setJWT, errorRequestingAuth } = this.props;
    const { phoneNumber, code } = this.state;

    requestAuth();
    verifyAuthenticationCode(phoneNumber, code)
      .then(res => {
        console.log(res);
        // if (res) setJWT()
      })
      .catch(err => {
        errorRequestingAuth(err);
      });
  };

  render() {
    const { loading, isAwaitingCode, authError } = this.props;
    const { phoneNumber, code } = this.state;

    return (
      <View style={styles.container}>
        <Text>Auth page!</Text>
        {loading ? <Text>loading!!</Text> : null}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
