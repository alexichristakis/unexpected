import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ListRenderItemInfo
} from "react-native";

import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Contacts from "react-native-contacts";
import _ from "lodash";
import uuid from "uuid/v4";

import { Button, UserImage, UserRow } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { TextStyles } from "@lib/styles";
import * as selectors from "@redux/selectors";
import { Actions as UserActions } from "@redux/modules/user";
import { ReduxPropsType, RootState } from "@redux/types";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { StackParamList } from "../App";
import { UserType } from "unexpected-cloud/models/user";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state),
  users: selectors.users(state)
});
const mapDispatchToProps = {
  acceptRequest: UserActions.acceptRequest,
  denyRequest: UserActions.denyRequest,
  fetchUsers: UserActions.fetchUsers
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
    fetchUsers,
    acceptRequest,
    denyRequest,
    phoneNumber
  }) => {
    useLightStatusBar();

    useFocusEffect(
      useCallback(() => {
        fetchUsers(user.friendRequests, ["firstName", "lastName"]);
      }, [])
    );

    const getContacts = () => {
      Contacts.getAllWithoutPhotos((err, contacts) => {
        console.log(contacts);
      });
    };

    const navigateToNewProfilePicture = () => {
      navigation.navigate("NEW_PROFILE_PICTURE");
    };

    const navigateToEditBio = () => {
      navigation.navigate("EDIT_BIO");
    };

    const getUsers = () => {
      return _.filter(users, o =>
        _.includes(user.friendRequests, o.phoneNumber)
      );
    };

    const handleOnPressUser = (toUser: UserType) => {
      if (phoneNumber === toUser.phoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: {
            user: toUser
          }
        });
      }
    };

    const renderUserRow = ({ item, index }: ListRenderItemInfo<UserType>) => {
      const actions = [
        { title: "accept", onPress: () => acceptRequest(item) },
        { title: "deny", onPress: () => denyRequest(item) }
      ];
      return (
        <UserRow onPress={handleOnPressUser} user={item} actions={actions} />
      );
    };

    const renderListFooter = () => (
      <View style={styles.buttonContainer}>
        <Button
          title="update picture"
          style={styles.button}
          onPress={navigateToNewProfilePicture}
        />
        <Button
          title="edit bio"
          style={styles.button}
          onPress={navigateToEditBio}
        />
        <Button
          title="permissions"
          style={styles.button}
          onPress={() => navigation.navigate("PERMISSIONS")}
        />
        <Button
          title="sync contacts"
          style={styles.button}
          onPress={getContacts}
        />
      </View>
    );

    return (
      <Screen style={styles.container}>
        <Text style={[TextStyles.medium, styles.header]}>settings:</Text>
        <FlatList
          renderItem={renderUserRow}
          data={getUsers()}
          ListFooterComponent={renderListFooter()}
        />
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
    marginBottom: 20
  },
  button: {
    marginBottom: 20
  },
  buttonContainer: {
    marginTop: 20
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
