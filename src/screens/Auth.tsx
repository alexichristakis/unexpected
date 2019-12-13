import { Formik } from "formik";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import MaskedView from "@react-native-community/masked-view";

import { Background, CodeInput, PhoneNumberInput } from "@components/Auth";
import { Button } from "@components/universal";
import { TextStyles, isIPhoneX, SB_HEIGHT } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { ReduxPropsType, RootState as RootStateType } from "@redux/types";

const mapStateToProps = ({ auth }: RootStateType, ownProps: AuthOwnProps) => ({
  ...auth,
  ...ownProps
});
const mapDispatchToProps = {
  requestAuth: AuthActions.requestAuth,
  checkCode: AuthActions.checkCode
};

export type AuthReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
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
      <MaskedView
        style={{
          position: "absolute",
          top: 50 + SB_HEIGHT(),
          left: 50,
          bottom: 50,
          right: 50
        }}
        maskElement={
          <>
            <Text
              style={[TextStyles.title, { fontSize: 40, fontWeight: "500" }]}
            >
              expect.photos
            </Text>
            <Text style={[TextStyles.large]}>random photo sharing</Text>
          </>
        }
      >
        <Background />
      </MaskedView>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.subContainer}
        onPress={Keyboard.dismiss}
      >
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
                  disabled={values.phoneNumber.length !== 10}
                  style={styles.button}
                  size="medium"
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
    padding: 50,
    justifyContent: "space-around"
  },
  subContainer: {
    width: "100%",
    height: "100%",
    paddingVertical: isIPhoneX ? 100 : 0,
    justifyContent: "space-around",
    backgroundColor: "transparent"
  },
  formFields: {
    flex: 1,
    justifyContent: "space-around"
  },
  button: {
    marginBottom: 45
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
