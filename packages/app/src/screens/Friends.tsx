import React, { useCallback, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _ from "lodash";
import Animated from "react-native-reanimated";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import { ItemSeparator, NavBar, UserRow } from "@components/universal";
import { SB_HEIGHT, TextSizes, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { User } from "@unexpected/global";
import { onScroll } from "react-native-redash";
import { StackParamList } from "../App";

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

  const [scrollY] = useState(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      fetchUsers(user.friends, ["firstName", "lastName"]);

      return () => {};
    }, [])
  );

  const handleOnPressUser = (toUser: User) => {
    if (phoneNumber === toUser.phoneNumber) {
      navigation.navigate("USER_PROFILE");
    } else {
      navigation.navigate({
        name: "PROFILE",
        key: uuid(),
        params: {
          prevRoute: "Friends",
          phoneNumber: toUser.phoneNumber
        }
      });
    }
  };

  const getUsers = () => {
    return _.filter(users, o => _.includes(user.friends, o.phoneNumber));
  };

  const renderUserRow = ({ item, index }: ListRenderItemInfo<User>) => (
    <UserRow onPress={handleOnPressUser} user={item} />
  );

  const animatedHeaderStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: [-50, 0, 0]
        })
      }
    ]
  };

  const renderTop = () => (
    <Animated.Text style={[styles.header, animatedHeaderStyle]}>
      Friends
    </Animated.Text>
  );

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Text
          style={TextStyles.medium}
        >{`${user.firstName} doesn't have any friends yet. Send them a request to be their first!`}</Text>
      </View>
    );
  };

  const renderSeparatorComponent = () => <ItemSeparator />;

  return (
    <Screen style={styles.container}>
      <NavBar
        showBackButtonText={true}
        backButtonText={user.firstName}
        navigation={navigation}
      />
      <FlatList
        style={styles.list}
        renderItem={renderUserRow}
        // contentContainerStyle={{ paddingHorizontal: 20 }}
        ListHeaderComponent={renderTop}
        ListEmptyComponent={renderEmptyComponent}
        ItemSeparatorComponent={renderSeparatorComponent}
        data={getUsers()}
        renderScrollComponent={props => (
          <Animated.ScrollView
            {...props}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onScroll={onScroll({ y: scrollY })}
          />
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT(),
    justifyContent: "center"
  },
  header: {
    ...TextStyles.title,
    marginHorizontal: 20,
    paddingTop: 5,
    alignSelf: "stretch"
  },
  list: {
    height: "100%",
    width: "100%"
  },
  emptyStateContainer: {
    marginTop: 20
    // alignItems: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
