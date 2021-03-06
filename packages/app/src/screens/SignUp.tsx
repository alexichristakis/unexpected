import { Formik } from "formik";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect } from "react-redux";

import { Button, Input } from "@components/universal";
import { useDarkStatusBar } from "@hooks";
import { isIPhoneX, TextStyles } from "@lib";
import { Actions, UserState as UserStateType } from "@redux/modules/user";
import { RootState as RootStateType } from "@redux/types";

import { StackParamList } from "../App";

export interface SignUpReduxProps {
  createUser: typeof Actions.createUser;
}
export interface SignUpOwnProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}
export type SignUpProps = SignUpReduxProps & SignUpOwnProps & UserStateType;
const initialFormValues = { firstName: "", lastName: "" };
const SignUp: React.FC<SignUpProps> = ({ createUser, loading, navigation }) => {
  useDarkStatusBar();

  const handleSubmit = (values: typeof initialFormValues) => {
    const { firstName, lastName } = values;
    createUser(firstName, lastName, navigation);
  };

  const validate = (values: typeof initialFormValues) => {
    return !(values.firstName.length > 0 && values.lastName.length > 0);
  };

  return (
    <Screen stackPresentation={"push"} style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.subContainer}
        onPress={Keyboard.dismiss}
      >
        <View>
          <Text style={TextStyles.title}>sign up</Text>
          <Text style={TextStyles.large}>create your account</Text>
        </View>
        <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
          {({ values, handleChange, handleSubmit }) => (
            <KeyboardAvoidingView
              enabled={true}
              behavior="padding"
              style={styles.formFields}
            >
              <Input
                label="enter your first name"
                placeholder="first name"
                value={values.firstName}
                onChangeText={handleChange("firstName")}
              />
              <Input
                label="and last name"
                placeholder="last name"
                value={values.lastName}
                onChangeText={handleChange("lastName")}
              />
              <Button
                // loading={loading}
                // disabled={validate(values)}
                style={{ marginBottom: 45 }}
                title="get started"
                onPress={handleSubmit}
              />
            </KeyboardAvoidingView>
          )}
        </Formik>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
    justifyContent: "space-around",
  },
  subContainer: {
    width: "100%",
    height: "100%",
    paddingVertical: isIPhoneX ? 100 : 0,
    paddingBottom: isIPhoneX ? 0 : 100,
    justifyContent: "space-around",
  },
  formFields: {
    flex: 1,
    justifyContent: "space-around",
  },
});

const mapStateToProps = (
  { user }: RootStateType,
  ownProps: SignUpOwnProps
) => ({
  ...user,
  ...ownProps,
});
const mapDispatchToProps = {
  ...Actions,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
