import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData
} from "react-native";

import client, { getHeaders } from "@api";
import { connect } from "react-redux";
import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import uuid from "uuid/v4";

import { StackParamList } from "../../App";
import { Input, UserRow, ItemSeparator } from "@components/universal";
import * as selectors from "@redux/selectors";
import { Actions as UserActions } from "@redux/modules/user";
import { ReduxPropsType, RootState } from "@redux/types";
import { Screen } from "react-native-screens";
import { TextSizes } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state),
  jwt: selectors.jwt(state)
});
const mapDispatchToProps = {
  friendUser: UserActions.friendUser
};

export type DiscoverReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface DiscoverProps {
  navigation: NativeStackNavigationProp<StackParamList, "DISCOVER">;
  route: RouteProp<StackParamList, "DISCOVER">;
}
export const Discover: React.FC<DiscoverProps &
  DiscoverReduxProps> = React.memo(
  ({ phoneNumber, jwt, friendUser, navigation }) => {
    const [responses, setResponses] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);

    const renderUserRow = ({ item, index }: ListRenderItemInfo<UserType>) => {
      const actions = [
        { title: "add friend", onPress: () => friendUser(item) }
      ];
      return (
        <UserRow onPress={handleOnPressUser} user={item} actions={actions} />
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

      setResponses(data);
      setLoading(false);
    };

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
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center"
  },
  list: { height: "100%", width: "100%" }
});

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
