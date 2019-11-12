import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import Contacts from "react-native-contacts";

import { ReduxPropsType } from "@redux/types";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

export type SettingsReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface SettingsProps extends SettingsReduxProps {}

const Settings: React.FC<SettingsProps> = React.memo(({}) => {
  const getContacts = () => {
    Contacts.getAllWithoutPhotos((err, contacts) => {
      console.log(contacts);
    });
  };

  return (
    <Screen style={styles.container}>
      <Text>Settings!</Text>
    </Screen>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
