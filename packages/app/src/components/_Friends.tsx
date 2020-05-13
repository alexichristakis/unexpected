import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { interpolate } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  useTransition,
  useVector,
  useValue,
  useGestureHandler,
  withSpring,
  usePanGestureHandler,
  mix,
} from "react-native-redash";
import { StackNavigationProp } from "@react-navigation/stack";

import { RootState } from "@redux/types";
import { FriendsContext } from "@hooks";
import { Colors, SCREEN_WIDTH } from "@lib";
import { POST_HEIGHT } from "./Post";
import { StackParamList } from "App";
import { useMemoOne } from "use-memo-one";

const connector = connect((state: RootState) => ({}), {});

export type FriendsConnectedProps = ConnectedProps<typeof connector>;

export interface FriendsProps {
  navigation: StackNavigationProp<StackParamList>;
}

const Friends: React.FC<FriendsProps & FriendsConnectedProps> = ({
  navigation,
}) => {
  const { isOpen, close } = useContext(FriendsContext);

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
        snapPoints: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      }),
    []
  );

  const transition = useTransition(isOpen);

  //   if (isOpen)
  return (
    <View style={styles.container}>
      <Animated.View
        onTouchEnd={close}
        style={[styles.overlay, { opacity: transition }]}
      />
      <Animated.View
        style={{
          rotate: mix(transition, -Math.PI / 8, 0),
        }}
      >
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
          ></Animated.View>
        </PanGestureHandler>
      </Animated.View>
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
    backgroundColor: Colors.transGray,
  },
  card: {
    borderRadius: 20,
    backgroundColor: Colors.background,
    height: POST_HEIGHT,
    width: SCREEN_WIDTH - 40,
  },
});

export default connector(Friends);
