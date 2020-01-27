import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import React, { useCallback } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Background, CodeInput, PhoneNumberInput } from "@components/Auth";
import { Button } from "@components/universal";
import { useDarkStatusBar, useLightStatusBar } from "@hooks";
import { TextStyles } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { ReduxPropsType, RootState as RootStateType } from "@redux/types";
import { StackParamList } from "../App";

const mapStateToProps = ({ auth }: RootStateType, ownProps: AuthOwnProps) => ({
  ...auth,
  ...ownProps
});
const mapDispatchToProps = {
  reset: AuthActions.reset,
  requestAuth: AuthActions.requestAuth,
  checkCode: AuthActions.checkCode
};

export type AuthReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface AuthOwnProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const initialFormValues = { phoneNumber: "", code: "" };
const Auth: React.FC<AuthReduxProps & AuthOwnProps> = ({
  navigation,
  loading,
  reset,
  isAwaitingCode,
  authError,
  requestAuth,
  checkCode
}) => {
  useDarkStatusBar();

  useFocusEffect(
    useCallback(() => {
      reset();

      return () => {};
    }, [])
  );

  const handleSubmit = (values: typeof initialFormValues) => {
    if (isAwaitingCode) {
      checkCode(values.phoneNumber, values.code, navigation);
    } else {
      requestAuth(values.phoneNumber);
    }
  };

  return (
    <Screen style={styles.container}>
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
    justifyContent: "space-around"
  },
  subContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
    backgroundColor: "transparent"
  },
  formFields: {
    flex: 1,
    paddingTop: 50,
    justifyContent: "space-around"
  },
  title: {
    ...TextStyles.title,
    fontSize: 40,
    fontWeight: "500"
    // color: "white"
  },
  subtitle: {
    ...TextStyles.large
    // color: "white"
  },
  button: {
    marginBottom: 45
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
