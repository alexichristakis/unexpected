import { Formik } from "formik";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "react-native-screens";
import { connect, MapStateToProps } from "react-redux";

import { CodeInput, PhoneNumberInput } from "@components/Auth";
import { Button } from "@components/universal";
import { TextStyles } from "@lib/styles";
import { Actions as AuthActions, AuthState as AuthStateType } from "@redux/modules/auth";
import { ReduxPropsType, RootState as RootStateType } from "@redux/types";

const mapStateToProps = ({ auth }: RootStateType, ownProps: AuthOwnProps) => ({
  ...auth,
  ...ownProps
});
const mapDispatchToProps = {
  requestAuth: AuthActions.requestAuth,
  checkCode: AuthActions.checkCode
};

export type AuthReduxProps = ReduxPropsType<typeof mapStateToProps, typeof mapDispatchToProps>;
export interface AuthOwnProps {}

const initialFormValues = { phoneNumber: "", code: "" };
const Auth: React.FC<AuthReduxProps & AuthOwnProps> = ({
  loading,
  isAwaitingCode,
  authError,
  requestAuth,
  checkCode
}) => {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
