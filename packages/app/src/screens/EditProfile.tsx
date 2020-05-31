import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputKeyPressEventData,
  TextInputSubmitEditingEventData,
  View,
} from "react-native";
import { Formik } from "formik";
import { RouteProp } from "@react-navigation/core";
import _ from "lodash";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { Button, Input } from "@components/universal";
import { useLightStatusBar, useEditableUserImage } from "@hooks";
import { isIPhoneX, TextStyles, SB_HEIGHT } from "@lib";
import { RootState, selectors, UserActions } from "@redux";

import CloseIcon from "@assets/svg/close.svg";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState, props: EditProfileProps) => ({
  id: selectors.userId(state),
  user: selectors.currentUser(state),
  loading: selectors.userLoading(state),
});
const mapDispatchToProps = {
  updateUser: UserActions.updateUser,
};

export type EditProfileConnectedProps = ConnectedProps<typeof connector>;

export interface EditProfileProps {
  navigation: NativeStackNavigationProp<StackParamList, "EDIT_PROFILE">;
  route: RouteProp<StackParamList, "EDIT_PROFILE">;
}

const EditProfile: React.FC<EditProfileProps & EditProfileConnectedProps> = ({
  id,
  user: { firstName, lastName, bio = "" },
  loading,
  navigation,
  updateUser,
}) => {
  const parentRef = useRef<View>(null);

  useLightStatusBar();

  const { editing, UserImage, EditUserImageOverlay } = useEditableUserImage({
    id,
    size: 150,
    parent: parentRef,
  });

  const handleOnPressSubmit = (values: typeof initialFormValues) => {
    updateUser({ ...values });
  };

  const handleKeyPress = ({
    nativeEvent,
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
    <View ref={parentRef} style={styles.container}>
      <TouchableOpacity onPress={handleOnPressDismiss} style={{ zIndex: 1 }}>
        <CloseIcon width={20} height={20} />
      </TouchableOpacity>
      <Formik initialValues={initialFormValues} onSubmit={handleOnPressSubmit}>
        {({ values, handleChange, handleSubmit }) => (
          <View style={styles.formContainer}>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <UserImage />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Input
                  style={{ marginBottom: 10 }}
                  value={values.firstName}
                  placeholder={firstName}
                  label="first name"
                  returnKeyType="done"
                  autoCapitalize="none"
                  onChangeText={(text) =>
                    handleChange("firstName")(text.replace("\n", ""))
                  }
                  maxLength={200}
                  onKeyPress={handleKeyPress}
                  onEndEditing={(_) => handleSubmit()}
                />
                <Input
                  style={{ marginBottom: 10 }}
                  placeholder={lastName}
                  value={values.lastName}
                  label="last name"
                  returnKeyType="done"
                  autoCapitalize="none"
                  onChangeText={(text) =>
                    handleChange("lastName")(text.replace("\n", ""))
                  }
                  maxLength={200}
                  onKeyPress={handleKeyPress}
                  onEndEditing={(_) => handleSubmit()}
                />
              </View>
            </View>
            <Input
              placeholder="add a bio"
              label="bio: up to 200 characters"
              returnKeyType="done"
              multiline={true}
              autoCapitalize="none"
              value={values.bio}
              onChangeText={(text) =>
                handleChange("bio")(text.replace("\n", ""))
              }
              maxLength={200}
              onKeyPress={handleKeyPress}
              onEndEditing={(_) => handleSubmit()}
            />
          </View>
        )}
      </Formik>

      <EditUserImageOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formContainer: {},
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(EditProfile);
