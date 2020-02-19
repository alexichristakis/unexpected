import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputSubmitEditingEventData,
  View
} from "react-native";

import client, { getHeaders } from "@api";
import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";
import uuid from "uuid/v4";

import { Input, ItemSeparator, UserRow } from "@components/universal";
import { useDarkStatusBar } from "@hooks";
import { SB_HEIGHT, TextSizes, TextStyles } from "@lib/styles";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { User } from "@unexpected/global";

import { ParamList } from "../../App";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state),
  jwt: selectors.jwt(state)
});
const mapDispatchToProps = {
  loadUsers: UserActions.loadUsers
};

export type DiscoverConnectorProps = ConnectedProps<typeof connector>;
export interface DiscoverProps {
  navigation: NativeStackNavigationProp<ParamList, "DISCOVER">;
  route: RouteProp<ParamList, "DISCOVER">;
}
export const Discover: React.FC<DiscoverProps &
  DiscoverConnectorProps> = React.memo(
  ({ phoneNumber, jwt, navigation, loadUsers }) => {
    const [responses, setResponses] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useDarkStatusBar();

    const renderUserRow = ({ item, index }: ListRenderItemInfo<User>) => (
      <UserRow onPress={handleOnPressUser} user={item} />
    );

    const handleOnPressUser = (toUser: User) => {
      if (phoneNumber === toUser.phoneNumber) {
        navigation.navigate("USER_PROFILE_TAB");
      } else {
        navigation.navigate({
          name: "PROFILE",
          key: uuid(),
          params: {
            prevRoute: "Search",
            phoneNumber: toUser.phoneNumber
          }
        });
      }
    };

    const handleOnPressSubmit = async ({
      nativeEvent
    }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      setLoading(true);

      const response = await client.get<User[]>(
        `/user/search/${nativeEvent.text}`,
        {
          headers: getHeaders({ jwt })
        }
      );

      const { data } = response;

      const results = data.length
        ? data.filter(o => o.phoneNumber !== phoneNumber)
        : [];

      loadUsers(results);
      setResponses(results);
      setLoading(false);
    };

    const renderEmptyComponent = () => (
      <View style={{ padding: 20 }}>
        <Text style={TextStyles.medium}>No results</Text>
      </View>
    );

    const renderSeparatorComponent = () => <ItemSeparator />;

    return (
      <Screen style={styles.container}>
        <Input
          size={TextSizes.title}
          style={{ width: "100%", paddingHorizontal: 20 }}
          returnKeyType={"search"}
          label="enter a name or phone number"
          placeholder="search"
          onSubmitEditing={handleOnPressSubmit}
        />
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            style={styles.list}
            renderItem={renderUserRow}
            ListEmptyComponent={renderEmptyComponent}
            ItemSeparatorComponent={renderSeparatorComponent}
            data={responses}
          />
        )}
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingTop: SB_HEIGHT,
    // paddingHorizontal: 20,
    alignItems: "center"
  },
  list: { height: "100%", width: "100%" }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Discover);
