import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TextInputSubmitEditingEventData,
  View
} from "react-native";

import client, { getHeaders } from "@api";
import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { connect } from "react-redux";
import uuid from "uuid/v4";
import { Screen } from "react-native-screens";

import {
  FriendButton,
  Input,
  ItemSeparator,
  UserRow
} from "@components/universal";
import { useDarkStatusBar } from "@hooks";
import { SB_HEIGHT, TextSizes, TextStyles } from "@lib/styles";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { User } from "@unexpected/global";

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
  const [responses, setResponses] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useDarkStatusBar();

  const renderUserRow = ({ item, index }: ListRenderItemInfo<User>) => (
    <UserRow onPress={handleOnPressUser} user={item} />
  );

  const handleOnPressUser = (toUser: User) => {
    if (phoneNumber === toUser.phoneNumber) {
      navigation.navigate("USER_PROFILE");
    } else {
      navigation.navigate({
        name: "PROFILE",
        key: uuid(),
        params: {
          prevRoute: "Search",
          user: toUser
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
