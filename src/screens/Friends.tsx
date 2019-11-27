import React, { useCallback } from "react";
import { StyleSheet, FlatList, ListRenderItemInfo } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";
import _ from "lodash";

import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Actions as UserActions } from "@redux/modules/user";
import { StackParamList } from "../App";
import { UserType } from "unexpected-cloud/models/user";
import { UserRow, ItemSeparator } from "@components/universal";
import { SB_HEIGHT } from "@lib/styles";

const mapStateToProps = (state: RootState, props: FriendsProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  loading: selectors.userLoading(state),
  users: selectors.users(state)
});
const mapDispatchToProps = {
  fetchUsers: UserActions.fetchUsers
};

export type FriendsReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface FriendsProps {
  navigation: NativeStackNavigationProp<StackParamList, "FRIENDS">;
  route: RouteProp<StackParamList, "FRIENDS">;
}

const Friends: React.FC<FriendsProps & FriendsReduxProps> = ({
  phoneNumber,
  navigation,
  loading,
  users,
  route,
  fetchUsers
}) => {
  const { user } = route.params;

  useFocusEffect(
    useCallback(() => {
      fetchUsers(user.friends, ["firstName", "lastName"]);
    }, [])
  );

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

  const getUsers = () => {
    return _.filter(users, o => _.includes(user.friends, o.phoneNumber));
  };

  const renderUserRow = ({ item, index }: ListRenderItemInfo<UserType>) => (
    <UserRow onPress={handleOnPressUser} user={item} />
  );

  const renderSeparatorComponent = () => <ItemSeparator />;

  return (
    <Screen style={styles.container}>
      <FlatList
        style={styles.list}
        renderItem={renderUserRow}
        ItemSeparatorComponent={renderSeparatorComponent}
        data={getUsers()}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT(),
    paddingHorizontal: 20,
    justifyContent: "center"
  },
  list: {
    height: "100%",
    width: "100%"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
