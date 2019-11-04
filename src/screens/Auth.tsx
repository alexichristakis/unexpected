import React from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { Formik } from "formik";

import { RootState as RootStateType } from "@redux/types";
import { Actions, AuthState as AuthStateType } from "@redux/modules/auth";
import { PhoneNumberInput, CodeInput } from "@components/Auth";
import { Button } from "@components/universal";
import { TextStyles } from "@lib/styles";

export interface AuthReduxProps {
  requestAuth: typeof Actions.requestAuth;
  checkCode: typeof Actions.checkCode;
}
export interface AuthOwnProps {}
export type AuthProps = AuthReduxProps & AuthOwnProps & AuthStateType;

const initialFormValues = { phoneNumber: "", code: "" };
const Auth = ({ loading, isAwaitingCode, authError, requestAuth, checkCode }: AuthProps) => {
  const handleSubmit = (values: typeof initialFormValues) => {
    if (isAwaitingCode) {
      checkCode(values.phoneNumber, values.code);
    } else {
      requestAuth(values.phoneNumber);
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={TextStyles.large}>expect.photos</Text>
      <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
          return (
            <>
              <View style={styles.formFields}>
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
              </View>
              <Button
                size="large"
                title={isAwaitingCode ? "verify code" : "send text message"}
                onPress={handleSubmit}
              />
            </>
          );
        }}
      </Formik>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  formFields: {
    marginVertical: 100
  }
});

const mapStateToProps = ({ auth }: RootStateType, ownProps: AuthOwnProps) => ({
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
