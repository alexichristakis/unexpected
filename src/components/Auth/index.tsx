import React from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { compose } from "redux";
import { connect } from "react-redux";

import { withApi, ApiProps } from "@api";
import { AuthState as AuthStateType, AppState as AppStateType } from "@redux/types";
import { Actions } from "@redux/auth";

export interface AuthReduxProps {
  requestAuth: typeof Actions.requestAuth;
  successTextingCode: typeof Actions.successTextingCode;
  errorRequestingAuth: typeof Actions.errorRequestingAuth;
  setJWT: typeof Actions.setJWT;
}
export interface AuthOwnProps extends ApiProps {}
export type AuthProps = AuthReduxProps & AuthOwnProps & AuthStateType;
class Auth extends React.Component<AuthProps> {
  state = {
    phoneNumber: "",
    code: ""
  };

  textAuthenticationCode = () => {
    const { api, requestAuth, successTextingCode, errorRequestingAuth } = this.props;
    const { phoneNumber } = this.state;

    requestAuth();
    api
      .requestAuthentication(phoneNumber)
      .then(res => {
        console.log("res:", res);
        successTextingCode();
      })
      .catch(err => {
        errorRequestingAuth(err);
      });
  };

  checkVerificationCode = () => {
    const { api, requestAuth, setJWT, errorRequestingAuth } = this.props;
    const { phoneNumber, code } = this.state;

    requestAuth();
    api
      .verifyAuthenticationCode(phoneNumber, code)
      .then(({ response, token }) => {
        console.log(response, token);
        if (response && token) {
          setJWT(token);
        }
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

export default withApi(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Auth)
);
