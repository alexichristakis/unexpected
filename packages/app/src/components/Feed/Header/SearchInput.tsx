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
      right: 0,
      width: mix(transition, 50, SCREEN_WIDTH - 50),
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
});

export default connector(Header);
