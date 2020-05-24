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
import { RootState } from "@redux/types";
import { SearchActions } from "@redux/modules";
import { PartialUser } from "@global";
import { UserRow } from "@components/universal";
import { StackParamList } from "App";

import SearchResults from "./SearchResults";
import SearchInput from "./SearchInput";

const { onChange, neq, cond, eq, call } = Animated;

const connector = connect((state: RootState) => ({}), {
  search: SearchActions.search,
});

export interface HeaderProps {
  navigation: StackNavigationProp<StackParamList>;
  offset: Animated.Node<number>;
}

export type HeaderConnectedProps = ConnectedProps<typeof connector>;

const Header: React.FC<HeaderProps & HeaderConnectedProps> = React.memo(
  ({ offset, navigation, search }) => {
    const inputRef = useRef<TextInput>(null);
    const [open, setSearchOpen] = useState(false);
    const state = useValue(State.UNDETERMINED);

    const handler = useGestureHandler({ state });

    const transition = useTransition(open, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    useCode(
      () => [
        onChange(
          state,
          cond(eq(state, State.END), [
            call([], () => setSearchOpen((prev) => !prev)),
          ])
        ),
      ],
      []
    );

    useEffect(() => {
      if (open) inputRef.current?.focus();
      else {
        inputRef.current?.clear();
        Keyboard.dismiss();
      }
    }, [open, inputRef]);

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

    const right = mix(transition, 27.5, SCREEN_WIDTH - 60);

    return (
      <View pointerEvents={"box-none"} style={styles.container}>
        <Animated.View
          style={{ ...background, ...styles.background }}
          pointerEvents={open ? "auto" : "none"}
          onTouchEnd={() => setSearchOpen(false)}
        />
        <SearchResults {...{ navigation, transition, open }} />
        <Animated.View
          style={{ ...styles.header, transform: [{ translateY }] }}
        >
          <Animated.Text
            style={{
              ...TextStyles.title,
              left: 25,
              opacity: mix(transition, 1, 0),
            }}
          >
            unexpected
          </Animated.Text>
          <SearchInput {...{ open, transition }} />
          <TapGestureHandler {...handler}>
            <Animated.View style={{ ...styles.center, right }}>
              <Search fill={Colors.background} width={25} height={25} />
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SB_HEIGHT + 40,
    // marginHorizontal: 25,
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
