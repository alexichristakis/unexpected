import React, { useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Share,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _ from "lodash";
import Contacts from "react-native-contacts";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import { Button, ItemSeparator, UserRow } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { TextSizes, TextStyles, isIPhoneX } from "@lib/styles";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { User } from "@unexpected/global";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  stale: selectors.userStale(state),
  friendRequests: selectors.friendRequestNumbers(state),
  phoneNumber: selectors.phoneNumber(state),
  user: selectors.currentUser(state),
  users: selectors.users(state)
});
const mapDispatchToProps = {
  fetchRequests: UserActions.fetchUsersRequests,
  fetchUsers: UserActions.fetchUsers,
  logout: AuthActions.logout
};

export type SettingsReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface SettingsProps extends SettingsReduxProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Settings: React.FC<SettingsProps> = React.memo(
  ({
    navigation,
    user,
    users,
    stale,
    fetchUsers,
    fetchRequests,
    friendRequests,
    phoneNumber,
    logout
  }) => {
    useLightStatusBar();

    useFocusEffect(
      useCallback(() => {
        fetchRequests();
        fetchUsers(friendRequests, ["firstName", "lastName"]);

        return () => {};
      }, [stale])
    );

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
        message: "https://expect.photos"
      });
    };

    return (
      <Screen style={styles.container}>
        <Text style={[TextStyles.large, styles.header]}>settings:</Text>
        <View style={[styles.buttonContainer]}>
          <Button
            title="update profile picture"
            style={styles.button}
            onPress={navigateToNewProfilePicture}
          />
          <Button
            title="edit profile"
            style={styles.button}
            onPress={navigateToEditProfile}
          />
          <Button
            title="permissions"
            style={styles.button}
            onPress={navigateToPermissions}
          />
          <Button
            title="share unexpected"
            style={styles.button}
            onPress={shareUnexpected}
          />
          {/* <Button
          title="sync contacts"
          style={styles.button}
          onPress={getContacts}
        /> */}
          <Button title="sign out" style={styles.button} onPress={logout} />
        </View>
        <Button
          title="dismiss"
          style={styles.button}
          onPress={navigation.goBack}
        />
      </Screen>
    );
  },
  (prevProps, nextProps) => prevProps.stale === nextProps.stale
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    paddingBottom: isIPhoneX ? 20 : 0,
    backgroundColor: "white"
  },
  listHeaderContainer: {
    paddingHorizontal: 20,
    width: "100%"
  },
  header: {
    padding: 20
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 20
  },
  buttonContainer: {
    flex: 1
    // paddingHorizontal: 20
    // marginTop: 20
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
