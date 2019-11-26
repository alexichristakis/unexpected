import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData
} from "react-native";

import client, { getHeaders } from "@api";
import { connect } from "react-redux";
import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import uuid from "uuid/v4";

import { StackParamList } from "../../App";
import { Input, UserRow } from "@components/universal";
import { Actions as AuthActions } from "@redux/modules/auth";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Screen, ScreenProps } from "react-native-screens";
import { TextSizes } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";

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
  // const [search, setSearch] = useState("");

  const renderUserRow = ({ item, index }: ListRenderItemInfo<UserType>) => (
    <UserRow onPress={handleOnPressUser} user={item} />
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

  const handleOnPressKey = async ({
    nativeEvent
  }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    setLoading(true);
    const response = await client.get<UserType[]>(
      `/user/search/${nativeEvent.text}`
    );

    const { data } = response;

    setResponses(data);
    setLoading(false);
  };

  return (
    <Screen style={styles.container}>
      <Input
        size={TextSizes.title}
        style={{ width: "100%" }}
        returnKeyType={"search"}
        label="enter a name or phone number"
        placeholder="search"
        onSubmitEditing={handleOnPressKey}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList renderItem={renderUserRow} data={responses} />
      )}
    </Screen>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
