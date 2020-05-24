import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { StackNavigationProp } from "@react-navigation/stack";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { UserRow } from "@components/universal";

import { StackParamList } from "App";
import { SB_HEIGHT } from "@lib";

export interface SearchProps {
  navigation: StackNavigationProp<StackParamList>;
  transition: Animated.Node<number>;
  open: boolean;
}

const connector = connect(
  (state: RootState) => ({
    results: selectors.searchResults(state),
  }),
  {}
);

export type SearchResultsConnectedProps = ConnectedProps<typeof connector>;

const Search: React.FC<SearchProps & SearchResultsConnectedProps> = ({
  navigation,
  transition,
  results,
  open,
}) => {
  const handleOnPressUser = useCallback((id: string) => {
    navigation.navigate("PROFILE", { id });
  }, []);

  return (
    <Animated.ScrollView
      pointerEvents={open ? "auto" : "none"}
      keyboardShouldPersistTaps="handled"
      style={{ ...styles.container, opacity: transition }}
    >
      {results.map((id) => (
        <UserRow
          style="card"
          key={id}
          onPress={handleOnPressUser}
          {...{ id }}
        />
      ))}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: SB_HEIGHT + 100,
    marginHorizontal: 10,
    // marginTop: 30,
    // flex: 1,
  },
});

export default connector(Search);
