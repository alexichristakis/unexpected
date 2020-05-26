import { StackNavigationProp } from "@react-navigation/stack";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, { interpolate } from "react-native-reanimated";
import { usePanGestureHandler } from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";

import { Colors, SCREEN_WIDTH, SPRING_CONFIG, TextStyles } from "@lib";
import { RouteProp } from "@react-navigation/core";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { StackParamList } from "App";
import { useMemoOne } from "use-memo-one";
import { POST_HEIGHT } from "./Post";
import { UserRow } from "./universal";

const {
  spring,
  neq,
  add,
  startClock,
  call,
  not,
  set,
  greaterThan,
  abs,
  cond,
  debug,
  eq,
  onChange,
  Clock,
  Value,
  and,
  stopClock,
  block,
  clockRunning,
} = Animated;

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
  friends,
}) => {
  const {
    gestureHandler,
    state,
    translation,
    velocity,
  } = usePanGestureHandler();

  const translateX = useMemoOne(() => {
    const offset = new Value(0);

    const clock = new Clock();
    const springState: Animated.SpringState = {
      finished: new Value(0),
      velocity: new Value(0),
      position: new Value(0),
      time: new Value(0),
    };

    const config = {
      toValue: new Value(0),
      ...SPRING_CONFIG,
    };

    const gestureAndAnimationIsOver = new Value(1);
    const isSpringInterrupted = and(
      eq(state, State.BEGAN),
      clockRunning(clock)
    );

    const finishSpring = [
      set(offset, springState.position),
      stopClock(clock),
      set(gestureAndAnimationIsOver, 1),
    ];

    return block([
      cond(isSpringInterrupted, finishSpring),
      cond(
        and(gestureAndAnimationIsOver, not(clockRunning(clock))),
        set(springState.position, offset)
      ),
      cond(and(eq(state, State.END), not(gestureAndAnimationIsOver)), [
        cond(and(not(clockRunning(clock)), not(springState.finished)), [
          set(springState.velocity, velocity.x),
          set(springState.time, 0),
          set(config.toValue, 0),
          cond(
            greaterThan(abs(translation.x), 100),
            call([], () => {
              if (navigation.canGoBack()) navigation.goBack();
            })
          ),

          startClock(clock),
        ]),
        spring(clock, springState, config),
        cond(springState.finished, finishSpring),
      ]),
      cond(neq(state, State.END), [
        set(gestureAndAnimationIsOver, 0),
        set(springState.finished, 0),
        set(springState.position, add(offset, translation.x)),
      ]),
      //   ),
      springState.position,
    ]);
  }, []);

  const handleOnPressUser = useCallback((id: string) => {
    navigation.goBack(); // jank
    navigation.navigate("PROFILE", { id });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        onTouchEnd={navigation.goBack}
        style={StyleSheet.absoluteFill}
      />
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          style={[
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
          <Text style={styles.header}>Friends</Text>
          <Animated.ScrollView style={styles.card}>
            {friends.map((id) => (
              <UserRow key={id} onPress={handleOnPressUser} {...{ id }} />
            ))}
          </Animated.ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
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
    maxHeight: POST_HEIGHT,
    width: SCREEN_WIDTH - 40,
    overflow: "hidden",
  },
  header: {
    ...TextStyles.large,
    color: Colors.lightGray,
    marginHorizontal: 20,
    marginBottom: 10,
  },
});

export default connector(Friends);
