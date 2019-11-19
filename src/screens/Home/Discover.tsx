import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";

import { Actions as AuthActions } from "@redux/modules/auth";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Screen, ScreenProps } from "react-native-screens";
import { Input } from "@components/universal";

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {};

export type DiscoverReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface DiscoverOwnProps {}
export type DiscoverProps = DiscoverOwnProps & DiscoverReduxProps;

export const Discover: React.FC<DiscoverProps> = React.memo(() => {
  const [search, setSearch] = useState("");

  return (
    <Screen style={styles.container}>
      <Input
        style={{ width: "100%" }}
        returnKeyType={"search"}
        label="enter a name or phone number"
        placeholder="search"
        onChangeText={setSearch}
      />
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
