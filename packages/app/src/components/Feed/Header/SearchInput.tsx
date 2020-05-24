import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
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

import Search from "@assets/svg/discover.svg";
import {
  Colors,
  SB_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TextStyles,
  isIPhoneX,
} from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { SearchActions } from "@redux/modules";
import { PartialUser } from "@global";
import { UserRow } from "@components/universal";
import { StackParamList } from "App";

import SearchResults from "./SearchResults";

const { onChange, neq, cond, eq, call } = Animated;

const connector = connect(
  (state: RootState) => ({
    term: selectors.searchTerm(state),
  }),
  {
    search: SearchActions.search,
  }
);

export interface SearchInputProps {
  open: boolean;
  transition: Animated.Node<number>;
}

export type SearchInputConnectdProps = ConnectedProps<typeof connector>;

const Header: React.FC<
  SearchInputProps & SearchInputConnectdProps
> = React.memo(({ open, transition, term, search }) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else {
      inputRef.current?.clear();
      Keyboard.dismiss();
    }
  }, [open, inputRef]);

  const searchBar = useMemoOne(
    () => ({
      right: mix(transition, 25, 15),
      left: mix(transition, SCREEN_WIDTH - 75, 15),
      borderRadius: 25,
      height: 50,
      transform: [{ scale: mix(transition, 0.8, 1) }],
    }),
    []
  );

  return (
    <Animated.View style={{ ...searchBar, ...styles.searchBar }}>
      {open ? (
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={term}
          onChangeText={search}
          placeholder="search"
        />
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  searchBar: {
    position: "absolute",
    justifyContent: "center",
    backgroundColor: "#d3d3d3",
  },
  input: {
    ...TextStyles.large,
    marginLeft: 50,
  },
});

export default connector(Header);
