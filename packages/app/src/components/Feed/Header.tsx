import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useCode,
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";

import Search from "@assets/svg/discover.svg";
import {
  Colors,
  SB_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TextStyles,
} from "@lib";
import { RootState } from "@redux/types";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  mix,
  useGestureHandler,
  useTransition,
  useValue,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

const { onChange, concat, neq, cond, eq, call } = Animated;

const connector = connect((state: RootState) => ({}), {});

export interface HeaderProps {
  offset: Animated.Node<number>;
}

export type HeaderConnectedProps = ConnectedProps<typeof connector>;

const Header: React.FC<HeaderProps & HeaderConnectedProps> = React.memo(
  ({ offset }) => {
    const inputRef = useRef<TextInput>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const state = useValue(State.UNDETERMINED);

    const handler = useGestureHandler({ state });

    const transition = useTransition(searchOpen, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    useCode(
      () => [
        onChange(
          state,
          cond(eq(state, State.END), [
            call([], () => {
              setSearchOpen((prev) => !prev);
            }),
          ])
        ),
      ],
      []
    );

    useEffect(() => {
      if (searchOpen) inputRef.current?.focus();
      else {
        inputRef.current?.clear();
        Keyboard.dismiss();
      }
    }, [searchOpen, inputRef]);

    const translateY = interpolate(offset, {
      inputRange: [-10, 0, 10],
      outputRange: [-5, 0, 5],
    });

    const background = useMemoOne(
      () => ({
        left: interpolate(transition, {
          inputRange: [0, 0.5, 1],
          outputRange: [SCREEN_WIDTH - 70, 20, 0],
        }),
        right: mix(transition, 25, 0),
        top: interpolate(transition, {
          inputRange: [0, 0.25, 1],
          outputRange: [SB_HEIGHT + 30, SB_HEIGHT, 0],
        }),
        bottom: mix(transition, SCREEN_HEIGHT - SB_HEIGHT - 155, 0),
        borderRadius: interpolate(transition, {
          inputRange: [0, 0.5, 0.75, 1],
          outputRange: [75, 75, 75, 0],
        }),
        opacity: neq(transition, 0),
      }),
      []
    );

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

    const right = mix(transition, 2.5, SCREEN_WIDTH - 100);
    return (
      <View pointerEvents={"box-none"} style={styles.container}>
        <Animated.View style={{ ...background, ...styles.background }} />
        <Animated.View
          style={{ ...styles.header, transform: [{ translateY }] }}
        >
          <Animated.Text
            style={{
              ...TextStyles.title,
              opacity: mix(transition, 1, 0),
            }}
          >
            unexpected
          </Animated.Text>

          <Animated.View style={{ ...searchBar, ...styles.searchBar }}>
            {searchOpen ? (
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="search"
              />
            ) : null}
          </Animated.View>
          <TapGestureHandler {...handler}>
            <Animated.View style={{ ...styles.center, right }}>
              <Search fill={Colors.background} width={25} height={25} />
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
        <Animated.View
          pointerEvents={searchOpen ? "auto" : "none"}
          style={styles.results}
        >
          {/* render results as user row */}
        </Animated.View>
      </View>
    );
  }
);

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
  results: { marginTop: 30, flex: 1 },
});

export default connector(Header);
