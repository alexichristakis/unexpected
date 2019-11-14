import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Contacts from "react-native-contacts";

import { Button, UserImage } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { TextStyles } from "@lib/styles";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state)
});
const mapDispatchToProps = {};

export type SettingsReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface SettingsProps extends SettingsReduxProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Settings: React.FC<SettingsProps> = React.memo(
  ({ navigation, phoneNumber }) => {
    useLightStatusBar();

    const getContacts = () => {
      Contacts.getAllWithoutPhotos((err, contacts) => {
        console.log(contacts);
      });
    };

    const navigateToNewProfilePicture = () => {
      console.log("navigate");
      navigation.navigate("NEW_PROFILE_PICTURE");
    };

    return (
      <Screen style={styles.container}>
        <Text style={[TextStyles.medium, styles.header]}>settings:</Text>
        <UserImage phoneNumber={phoneNumber} size={100} />
        <Button title="update picture" onPress={navigateToNewProfilePicture} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    marginBottom: 40
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
