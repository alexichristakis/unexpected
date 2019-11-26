import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ListRenderItemInfo
} from "react-native";

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
import { UserRow } from "@components/universal";

const mapStateToProps = (state: RootState, props: EditBioProps) => ({
  user: selectors.user(state)
});
const mapDispatchToProps = {
  //   fetchEditBio: UserActions.fetchEditBio
};

export type EditBioReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface EditBioProps {
  navigation: NativeStackNavigationProp<StackParamList, "EDIT_BIO">;
  route: RouteProp<StackParamList, "EDIT_BIO">;
}

const EditBio: React.FC<EditBioProps & EditBioReduxProps> = ({ user }) => {
  return (
    <Screen style={styles.container}>
      <Text>edit bio screen</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EditBio);
