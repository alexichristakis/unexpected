import React from "react";
import { Share, StyleSheet, Text, View } from "react-native";

import _ from "lodash";
import Contacts from "react-native-contacts";
import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect } from "react-redux";

import { Button } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { isIPhoneX, TextSizes, TextStyles } from "@lib";
import { Actions as AuthActions } from "@redux/modules/auth";
import { ReduxPropsType, RootState } from "@redux/types";

import { StackParamList } from "../App";

const mapStateToProps = (_: RootState) => ({});
const mapDispatchToProps = {
  logout: AuthActions.logout,
};

export type SettingsReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface SettingsProps extends SettingsReduxProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Settings: React.FC<SettingsProps> = ({ navigation, logout }) => {
  useLightStatusBar();

  const getContacts = () => {
    Contacts.getAllWithoutPhotos((err, contacts) => {
      // console.log(contacts);
    });
  };

  const navigateToNewProfilePicture = () => {
    navigation.navigate("NEW_PROFILE_PICTURE");
  };

  const navigateToEditProfile = () => {
    navigation.navigate("EDIT_PROFILE");
  };

  const navigateToPermissions = () => {
    navigation.navigate("PERMISSIONS");
  };

  const shareUnexpected = async () => {
    const result = await Share.share({
      title: "share unexpected",
      message: "https://expect.photos",
    });
  };

  return (
    <Screen stackPresentation={"modal"} style={styles.container}>
      <Text style={[TextStyles.large, styles.header]}>settings:</Text>
      <View style={[styles.buttonContainer]}>
        <Button
          white={true}
          title="update profile picture"
          style={styles.button}
          onPress={navigateToNewProfilePicture}
        />
        <Button
          white={true}
          title="edit profile"
          style={styles.button}
          onPress={navigateToEditProfile}
        />
        <Button
          white={true}
          title="permissions"
          style={styles.button}
          onPress={navigateToPermissions}
        />
        <Button
          white={true}
          title="share unexpected"
          style={styles.button}
          onPress={shareUnexpected}
        />
        {/* <Button
          title="sync contacts"
          style={styles.button}
          onPress={getContacts}
        /> */}
        <Button
          white={true}
          title="sign out"
          style={styles.button}
          onPress={logout}
        />
      </View>
      <Button
        white={true}
        title="dismiss"
        style={styles.button}
        onPress={navigation.goBack}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    paddingBottom: isIPhoneX ? 20 : 0,
    backgroundColor: "white",
  },
  listHeaderContainer: {
    paddingHorizontal: 20,
    width: "100%",
  },
  header: {
    padding: 20,
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  buttonContainer: {
    flex: 1,
    // paddingHorizontal: 20
    // marginTop: 20
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
