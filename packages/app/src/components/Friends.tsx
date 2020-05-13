import React, { useContext } from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, {
  interpolate,
  useCode,
  debug,
  eq,
} from "react-native-reanimated";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useTransition,
  useVector,
  useValue,
  useGestureHandler,
  withSpring,
  usePanGestureHandler,
  mix,
  spring,
} from "react-native-redash";
import { StackNavigationProp } from "@react-navigation/stack";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { FriendsContext } from "@hooks";
import { Colors, SCREEN_WIDTH } from "@lib";
import { POST_HEIGHT } from "./Post";
import { StackParamList } from "App";
import { useMemoOne } from "use-memo-one";
import { RouteProp } from "@react-navigation/core";
import { UserRow } from "./universal";

const { call, set, greaterThan, abs, cond } = Animated;

const connector = connect((state: RootState, props: FriendsProps) => {
  const { id } = props.route.params;
  return {
    friends: selectors.friends(state, { id }),
  };
}, {});

export type FriendsConnectedProps = ConnectedProps<typeof connector>;

export interface FriendsProps {
  navigation: StackNavigationProp<StackParamList, "FRIENDS">;
  route: RouteProp<StackParamList, "FRIENDS">;
}

const Friends: React.FC<FriendsProps & FriendsConnectedProps> = ({
  navigation,
  route,
  friends,
}) => {
  //   const { isOpen, close } = useContext(FriendsContext);

  //   const translateX = useValue(0);
  const {
    gestureHandler,
    state,
    translation,
    velocity,
  } = usePanGestureHandler();

  const translateX = useMemoOne(
    () =>
      withSpring({
        state,
        value: translation.x,
        velocity: velocity.x,
        snapPoints: [0],
      }),
    []
  );

  useCode(
    () => [
      //   cond(eq(state, State.ACTIVE), set(translateX, translation.x)),
      //   cond(
      //     eq(state, State.END),
      //     set(
      //       translateX,
      //       spring({ from: translation.x, to: 0, velocity: velocity.x })
      //     )
      //   ),
      cond(
        greaterThan(abs(translateX), 100),
        call([], () => {
          if (navigation.canGoBack()) navigation.goBack();
        })
      ),
    ],
    []
  );

  //   const transition = useTransition(isOpen);

  console.log("friends", friends);

  //   if (isOpen)
  return (
    <View style={styles.container}>
      <Animated.View
        onTouchEnd={navigation.goBack}
        style={StyleSheet.absoluteFill}
      />

      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          style={[
            styles.card,
            // @ts-ignore
            {
              transform: [
                { translateX },
                {
                  rotate: interpolate(translateX, {
                    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                    outputRange: [-Math.PI / 8, 0, Math.PI / 8],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.ScrollView style={{ flex: 1 }}>
            {friends.map((id) => (
              <Text>{id}</Text>
            ))}
          </Animated.ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );

  return null;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    borderRadius: 20,
    backgroundColor: Colors.background,
    height: POST_HEIGHT,
    width: SCREEN_WIDTH - 40,
  },
});

export default connector(Friends);
