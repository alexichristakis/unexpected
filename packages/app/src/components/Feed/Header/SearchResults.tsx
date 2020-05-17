import React, { useEffect, useRef, useState, useCallback } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useCode,
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  mix,
  useGestureHandler,
  useTransition,
  useValue,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { StackNavigationProp } from "@react-navigation/stack";

import { PartialUser } from "@global";
import {
  Colors,
  SB_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TextStyles,
} from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { UserRow } from "@components/universal";

import { StackParamList } from "App";

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
      style={styles.results}
    >
      {results.map((id) => (
        <UserRow onPress={handleOnPressUser} {...{ id }} />
      ))}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 80,
    paddingHorizontal: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    left: 0,
    right: 0,
  },
  background: {
    position: "absolute",
    backgroundColor: Colors.lightGray,
  },
  searchBar: {
    position: "absolute",
    justifyContent: "center",
    backgroundColor: "#d3d3d3",
  },
  input: {
    ...TextStyles.large,
    marginLeft: 50,
  },
  center: {
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  results: {
    marginTop: 30,
    flex: 1,
  },
});

export default connector(Search);
