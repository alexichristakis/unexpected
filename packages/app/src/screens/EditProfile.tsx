import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputKeyPressEventData,
  TextInputSubmitEditingEventData,
  View
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import _ from "lodash";
import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { Button, Input } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { isIPhoneX, TextStyles } from "@lib/styles";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Formik } from "formik";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState, props: EditProfileProps) => ({
  user: selectors.currentUser(state),
  loading: selectors.userLoading(state)
});
const mapDispatchToProps = {
  updateUser: UserActions.updateUser
};

export type EditProfileConnectedProps = ConnectedProps<typeof connector>;

export interface EditProfileProps {
  navigation: NativeStackNavigationProp<StackParamList, "EDIT_PROFILE">;
  route: RouteProp<StackParamList, "EDIT_PROFILE">;
}

const EditProfile: React.FC<EditProfileProps & EditProfileConnectedProps> = ({
  user: { firstName, lastName, bio },
  loading,
  navigation,
  updateUser
}) => {
  useLightStatusBar();

  const handleOnPressSubmit = (values: typeof initialFormValues) => {
    updateUser({ ...values });
  };

  const handleKeyPress = ({
    nativeEvent
  }: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (nativeEvent.key === "Enter") {
      Keyboard.dismiss();
    }
  };

  const handleOnPressDismiss = () => {
    navigation.goBack();
  };

  const initialFormValues = { firstName, lastName, bio };

  return (
    <Screen stackPresentation={"modal"} style={styles.container}>
      <Formik initialValues={initialFormValues} onSubmit={handleOnPressSubmit}>
        {({ values, handleChange, handleSubmit }) => (
          <>
            <Input
              style={{ marginBottom: 10 }}
              value={values.firstName}
              placeholder={firstName}
              label="first name"
              returnKeyType="done"
              onChangeText={handleChange("firstName")}
              maxLength={200}
              onKeyPress={handleKeyPress}
            />
            <Input
              style={{ marginBottom: 10 }}
              placeholder={lastName}
              value={values.lastName}
              label="last name"
              returnKeyType="done"
              onChangeText={handleChange("lastName")}
              maxLength={200}
              onKeyPress={handleKeyPress}
            />

            <Input
              placeholder="add a bio"
              label="bio: up to 200 characters"
              returnKeyType="done"
              value={values.bio}
              onChangeText={handleChange("bio")}
              maxLength={200}
              onKeyPress={handleKeyPress}
            />
            <Button
              title="save"
              loading={loading}
              style={{ marginTop: 20 }}
              onPress={handleSubmit}
            />
            <KeyboardAvoidingView
              keyboardVerticalOffset={isIPhoneX ? 80 : 20}
              style={styles.keyboardAvoiding}
              behavior="padding"
            >
              <Button title="dismiss" onPress={handleOnPressDismiss} />
            </KeyboardAvoidingView>
          </>
        )}
      </Formik>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  section: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  keyboardAvoiding: {
    bottom: isIPhoneX ? 40 : 20,
    left: 20,
    right: 20,

    position: "absolute"
    // marginTop: 100
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(EditProfile);
