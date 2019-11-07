import React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { RootState, ReduxPropsType } from "@redux/types";
import { Button, UserImage } from "@components/universal";
import * as selectors from "@redux/selectors";
import { TextStyles } from "@lib/styles";

const mapStateToProps = (state: RootState, ownProps: ProfileTopOwnProps) => ({
  ...selectors.user(state),
  ...ownProps
});
const mapDispatchToProps = {};

export type ProfileTopReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface ProfileTopOwnProps {}

const Top: React.FC<ProfileTopOwnProps & ProfileTopReduxProps> = ({ phoneNumber }) => {
  return (
    <View style={styles.container}>
      <UserImage phoneNumber={phoneNumber} size={50} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between"
  }
});

export const ProfileTop = connect(
  mapStateToProps,
  mapDispatchToProps
)(Top);
