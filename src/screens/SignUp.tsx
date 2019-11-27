import { Formik } from "formik";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Button, Input } from "@components/universal";
import { Actions, UserState as UserStateType } from "@redux/modules/user";
import { RootState as RootStateType } from "@redux/types";

export interface SignUpReduxProps {
  createUser: typeof Actions.createUser;
}
export interface SignUpOwnProps {
  //
}
export type SignUpProps = SignUpReduxProps & SignUpOwnProps & UserStateType;
const initialFormValues = { firstName: "", lastName: "" };
const SignUp: React.FC<SignUpProps> = ({ createUser, loading }) => {
  const handleSubmit = (values: typeof initialFormValues) => {
    const { firstName, lastName } = values;
    createUser({ firstName, lastName });
  };

  return (
    <Screen style={styles.container}>
      <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
        }) => {
          return (
            <>
              <View style={styles.formFields}>
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
              </View>
              <Button size="large" title="get started" onPress={handleSubmit} />
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
    padding: 50,
    justifyContent: "space-around"
  },
  formFields: {
    flex: 1,
    marginVertical: 100,
    justifyContent: "space-around"
  }
});

const mapStateToProps = (
  { user }: RootStateType,
  ownProps: SignUpOwnProps
) => ({
  ...user,
  ...ownProps
});
const mapDispatchToProps = {
  ...Actions
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
