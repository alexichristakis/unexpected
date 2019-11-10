import React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";

import { Button, UserImage } from "@components/universal";
import { TextStyles } from "@lib/styles";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

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

const _Top: React.FC<ProfileTopOwnProps & ProfileTopReduxProps> = ({ phoneNumber }) => {
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

export const Top = connect(
  mapStateToProps,
  mapDispatchToProps
)(_Top);
