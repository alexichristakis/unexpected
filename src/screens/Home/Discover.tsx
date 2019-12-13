import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputSubmitEditingEventData,
  View,
  StatusBar
} from "react-native";

import client, { getHeaders } from "@api";
import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import {
  Input,
  ItemSeparator,
  UserRow,
  FriendButton
} from "@components/universal";
import { SB_HEIGHT, TextSizes, TextStyles } from "@lib/styles";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Screen } from "react-native-screens";
import { UserType } from "unexpected-cloud/models/user";
import { StackParamList } from "../../App";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state),
  jwt: selectors.jwt(state)
});
const mapDispatchToProps = {};

export type DiscoverReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface DiscoverProps {
  navigation: NativeStackNavigationProp<StackParamList, "DISCOVER">;
  route: RouteProp<StackParamList, "DISCOVER">;
}
export const Discover: React.FC<DiscoverProps &
  DiscoverReduxProps> = React.memo(({ phoneNumber, jwt, navigation }) => {
  const [responses, setResponses] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    () =>
      // useCallback(() => {
      StatusBar.setHidden(false)
    // }, [])
  );

  const renderUserRow = ({ item, index }: ListRenderItemInfo<UserType>) => {
    const actions = [<FriendButton key="friend" user={item} />];

    return (
      <UserRow
        // key={index}
        onPress={handleOnPressUser}
        user={item}
        actions={actions}
      />
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

  const handleOnPressSubmit = async ({
    nativeEvent
  }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    setLoading(true);
    const response = await client.get<UserType[]>(
      `/user/search/${nativeEvent.text}`,
      {
        headers: getHeaders({ jwt })
      }
    );

    const { data } = response;

    const results = data.filter(o => o.phoneNumber !== phoneNumber);

    setResponses(results);
    setLoading(false);
  };

  const renderEmptyComponent = () => (
    <View style={{ paddingTop: 20 }}>
      <Text style={TextStyles.medium}>No results</Text>
    </View>
  );

  const renderSeparatorComponent = () => <ItemSeparator />;

  return (
    <Screen style={styles.container}>
      <Input
        size={TextSizes.title}
        style={{ width: "100%" }}
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
});

const styles = StyleSheet.create({
  container: {
    paddingTop: SB_HEIGHT(),
    paddingHorizontal: 20,
    alignItems: "center"
  },
  list: { height: "100%", width: "100%" }
});

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
