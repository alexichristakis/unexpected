import React from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { withApi, ApiProps } from "@api";
import { AppState as AppStateType } from "@redux/types";
import { Actions, AuthState as AuthStateType } from "@redux/modules/auth";
import { PhoneNumberInput, CodeInput } from "@components/Auth";

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
      <Screen style={styles.container}>
        <Text>Auth page!</Text>
        {loading ? <Text>loading!!</Text> : null}
        {isAwaitingCode ? <Text>code sent!</Text> : null}
        <PhoneNumberInput
          value={phoneNumber}
          onChange={({ nativeEvent: { text } }) => this.setState({ phoneNumber: text })}
        />
        <CodeInput
          value={code}
          onChange={({ nativeEvent: { text } }) => this.setState({ code: text })}
        />
        <Button
          title={isAwaitingCode ? "verify code" : "send text message"}
          onPress={isAwaitingCode ? this.checkVerificationCode : this.textAuthenticationCode}
        />
        {authError && <Text>{authError}</Text>}
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
