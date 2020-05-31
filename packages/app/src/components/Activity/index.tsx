import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import { ACTIVITY_HEIGHT, Colors, TextStyles } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import CloseButton from "./CloseButton";
import { UserRow } from "@components/universal";

const connector = connect(
  (state: RootState) => ({
    requests: selectors.requests(state),
  }),
  {}
);

export interface ActivityProps {
  open: Animated.Value<0 | 1>;
}

export type ActivityConnectedProps = ConnectedProps<typeof connector>;

const Activity: React.FC<ActivityProps & ActivityConnectedProps> = ({
  open,
  requests,
}) => {
  const renderRequests = () => {
    if (!requests.length) return null;

    return (
      <>
        <View style={styles.requestsHeader}>
          <Text style={styles.header}>Requests</Text>
        </View>
        {requests.map((id) => (
          <UserRow style="light" key={id} {...{ id }} />
        ))}
      </>
    );
  };

  const renderActivity = () => {
    return null;
  };

  return (
    <>
      <Animated.ScrollView style={styles.container} contentContainerStyle={{}}>
        {renderRequests()}
        {renderActivity()}
      </Animated.ScrollView>
      <CloseButton {...{ open }} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: ACTIVITY_HEIGHT,
  },
  requestsHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  header: {
    ...TextStyles.small,
    backgroundColor: Colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default connector(Activity);
