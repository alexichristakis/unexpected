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
      style={{ ...styles.container, opacity: transition }}
    >
      {results.map((id) => (
        <UserRow card key={id} onPress={handleOnPressUser} {...{ id }} />
      ))}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
  },
});

export default connector(Search);
