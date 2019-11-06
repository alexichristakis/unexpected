import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { connect } from "react-redux";

import * as selectors from "@redux/selectors";
import { Actions as AuthActions } from "@redux/modules/auth";
import { ReduxType } from "@lib/types";
import { RootState } from "@redux/types";
import { Screen, ScreenProps } from "react-native-screens";

const mapStateToProps = (state: RootState) => ({
  user: selectors.user(state)
});
const mapDispatchToProps = {
  logout: AuthActions.logout
};

export type UserProfileReduxProps = ReduxType<typeof mapStateToProps, typeof mapDispatchToProps>;
export interface UserProfileProps extends ScreenProps {}

const UserProfile: React.FC<UserProfileProps & UserProfileReduxProps> = ({ style, ...rest }) => {
  return (
    <Screen {...rest} style={[style, styles.container]}>
      <Text>UserProfile page!</Text>
    </Screen>
  );
};

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
)(UserProfile);
