import React, { useEffect, useState } from "react";
import { Animated, StatusBar, StyleSheet, View } from "react-native";

import { Colors, SCREEN_HEIGHT } from "@lib/styles";

const CIRCLE_SIZE = 2 * SCREEN_HEIGHT;

export const Background = React.memo(() => {
  const [animatedValues] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]);

  useEffect(() => {
    Animated.stagger(
      1111,
      animatedValues.map(value =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 20000
              // useNativeDriver: true
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 0
              // useNativeDriver: true
            })
          ])
        )
      )
    ).start();
  });

  const renderCircle = (value: Animated.Value, index: number) => (
    <Animated.View
      key={index}
      style={{
        position: "absolute",
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        marginLeft: -300,
        marginTop: 200,
        transform: [
          { scale: value },
          { translateX: -CIRCLE_SIZE / (index + 1) },
          { translateY: -CIRCLE_SIZE }
        ],
        backgroundColor: value.interpolate({
          inputRange: [0, 2],
          outputRange: [Colors.purple, Colors.pink]
        }),
        // opacity: 0.2
        opacity: value.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0]
        })
      }}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {animatedValues.map((value, i) => renderCircle(value, i))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#D31EB6",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});
