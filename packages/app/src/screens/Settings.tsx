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

    const handleOnPressUser = (toUser: User) => {
      if (phoneNumber === toUser.phoneNumber) {
        navigation.navigate("USER_PROFILE");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: {
            prevRoute: user.firstName,
            phoneNumber: toUser.phoneNumber
          }
        });
      }
    };

    const renderUserRow = ({ item, index }: ListRenderItemInfo<User>) => (
      <UserRow onPress={handleOnPressUser} user={item} />
    );

    const renderListHeader = (length: number) =>
      length ? (
        <View style={styles.listHeaderContainer}>
          <Text style={TextStyles.medium}>{`${length} friend ${
            length > 1 ? "requests" : "request"
          }:`}</Text>
        </View>
      ) : null;

    const renderListFooter = (length: number) => (
      <View style={[styles.buttonContainer, length ? { marginTop: 20 } : {}]}>
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
    );

    const renderSeparatorComponent = () => <ItemSeparator />;

    const data = friendRequests
      .filter(user => !!users[user])
      .map(user => users[user]);

    return (
      <Screen style={styles.container}>
        <Text style={[TextStyles.large, styles.header]}>settings:</Text>
        <FlatList
          renderItem={renderUserRow}
          data={data}
          ItemSeparatorComponent={renderSeparatorComponent}
          ListHeaderComponent={renderListHeader(friendRequests.length)}
          ListFooterComponent={renderListFooter(friendRequests.length)}
        />
        <Button title="dismiss" onPress={navigation.goBack} />
      </Screen>
    );
  },
  (prevProps, nextProps) => prevProps.stale === nextProps.stale
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    paddingBottom: isIPhoneX ? 40 : 20,
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
    marginBottom: 20
  },
  buttonContainer: {
    paddingHorizontal: 20
    // marginTop: 20
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
