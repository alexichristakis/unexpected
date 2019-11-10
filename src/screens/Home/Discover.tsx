import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";

import { Actions as AuthActions } from "@redux/modules/auth";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Screen, ScreenProps } from "react-native-screens";

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {};

export type DiscoverReduxProps = ReduxPropsType<typeof mapStateToProps, typeof mapDispatchToProps>;
export interface DiscoverOwnProps {}
export type DiscoverProps = DiscoverOwnProps & DiscoverReduxProps;

export const Discover: React.FC<DiscoverProps> = React.memo(() => {
  return (
    <Screen style={styles.container}>
      <Text>Discover page!</Text>
    </Screen>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "blue",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Discover);
