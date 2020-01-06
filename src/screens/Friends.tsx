import React, { useCallback, useState } from "react";
import {
  Animated,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _ from "lodash";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import {
  FriendButton,
  ItemSeparator,
  NavBar,
  UserRow
} from "@components/universal";
import { SB_HEIGHT, TextSizes, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { UserType } from "unexpected-cloud/models/user";
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
  const [onScroll] = useState(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true
    })
  );

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

  const renderUserRow = ({ item, index }: ListRenderItemInfo<UserType>) => {
    const actions = [
      <FriendButton key="friend" size={TextSizes.small} user={item} />
    ];

    return (
      <UserRow onPress={handleOnPressUser} user={item} actions={actions} />
    );
  };

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
      <NavBar backButtonText={formatName(user)} navigation={navigation} />
      <Animated.FlatList
        style={styles.list}
        onScroll={onScroll}
        renderItem={renderUserRow}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListHeaderComponent={renderTop}
        ListEmptyComponent={renderEmptyComponent}
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
    justifyContent: "center"
  },
  header: {
    ...TextStyles.title,
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
