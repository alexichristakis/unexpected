import { useFocusEffect } from "@react-navigation/core";
import { Formik } from "formik";
import React, { useCallback, useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { Background, CodeInput, PhoneNumberInput } from "@components/Auth";
import { Button } from "@components/universal";
import { useDarkStatusBar, useLightStatusBar } from "@hooks";
import { TextStyles } from "@lib";
import { Actions as AuthActions } from "@redux/modules/auth";
import { RootState as RootStateType } from "@redux/types";
import { StackParamList } from "../App";

const connector = connect(
  ({ auth }: RootStateType, ownProps: AuthOwnProps) => ({
    ...auth,
    ...ownProps,
  }),
  {
    reset: AuthActions.reset,
    requestAuth: AuthActions.requestAuth,
    checkCode: AuthActions.checkCode,
  }
);

export type AuthConnectedProps = ConnectedProps<typeof connector>;

export interface AuthOwnProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const initialFormValues = { phoneNumber: "", code: "" };
const Auth: React.FC<AuthConnectedProps & AuthOwnProps> = ({
  navigation,
  isNewAccount,
  jwt,
  loading,
  reset,
  isAwaitingCode,
  authError,
  requestAuth,
  checkCode,
}) => {
  useDarkStatusBar();

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (jwt && isNewAccount) {
      navigation.navigate("SIGN_UP");
    }
  }, [jwt, isNewAccount]);

  const handleSubmit = (values: typeof initialFormValues) => {
    if (isAwaitingCode) {
      checkCode(values.phoneNumber, values.code, navigation);
    } else {
      requestAuth(values.phoneNumber);
    }
  };

  return (
    <Screen stackPresentation={"push"} style={styles.container}>
      {/* <Background /> */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.subContainer}
        onPress={Keyboard.dismiss}
      >
        <Text style={styles.title}>unexpected</Text>
        <Text style={styles.subtitle}>random photo sharing</Text>
        <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
          {({ values, handleChange, handleSubmit }) => {
            return (
              <KeyboardAvoidingView
                enabled={true}
                behavior="padding"
                style={styles.formFields}
              >
                <PhoneNumberInput
                  loading={loading}
                  error={authError}
                  editable={!isAwaitingCode}
                  value={values.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                />
                <CodeInput
                  editable={isAwaitingCode}
                  error={authError}
                  value={values.code}
                  onChange={handleChange("code")}
                />
                <Button
                  // disabled={values.phoneNumber.length  10}
                  style={styles.button}
                  title={isAwaitingCode ? "verify code" : "send text message"}
                  onPress={handleSubmit}
                />
              </KeyboardAvoidingView>
            );
          }}
        </Formik>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 30,
    justifyContent: "space-around",
  },
  subContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
    backgroundColor: "transparent",
  },
  formFields: {
    flex: 1,
    paddingTop: 50,
    justifyContent: "space-around",
  },
  title: {
    ...TextStyles.title,
    fontSize: 40,
    fontWeight: "500",
    // color: "white"
  },
  subtitle: {
    ...TextStyles.large,
    // color: "white"
  },
  button: {
    marginBottom: 45,
  },
});

export default connector(Auth);
