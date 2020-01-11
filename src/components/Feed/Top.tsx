import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import moment, { Moment } from "moment";
import Haptics from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";

import { SCREEN_WIDTH, TextStyles } from "@lib/styles";

const {
  Value,
  block,
  cond,
  set,
  sub,
  onChange,
  call,
  and,
  lessThan,
  greaterOrEq,
  useCode
} = Animated;

export interface FeedTopProps {
  latest?: Date;
  readyForRefresh: 0 | 1;
  refreshing: boolean;
  scrollY: Animated.Value<number>;
}
export const Top: React.FC<FeedTopProps> = React.memo(
  ({ latest, scrollY, readyForRefresh, refreshing }) => {
    useEffect(() => {
      if (readyForRefresh) {
        Haptics.trigger("impactLight");
      }
    }, [readyForRefresh]);

    const animatedStyle = {
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [-50, 0, 50],
            outputRange: [-50, 0, 0]
          })
        }
      ]
    };

    const animatedLoaderStyle = {
      opacity: scrollY.interpolate({
        inputRange: [-100, 0, 50],
        outputRange: [1, 0, 0]
      }),
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [-50, 0, 50],
            outputRange: [-20, 0, 0]
          })
        }
      ]
    };

    const formatTitle = (date: Moment) => {
      const diff = date.diff(moment(), "days");

      let text = date.fromNow();
      if (diff <= 0) {
        if (diff === 0) text = "Today";
        if (diff === -1) text = "Yesterday";
      }

      return text;
    };

    if (latest) {
      const date = moment(latest);

      return (
        <>
          <Animated.Text
            style={[
              TextStyles.large,
              styles.loaderContainer,
              animatedLoaderStyle
            ]}
          >
            {readyForRefresh === 1 ? "release to refresh" : "pull to refresh"}
          </Animated.Text>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.textContainer}>
              <Text style={TextStyles.title}>{formatTitle(date)}</Text>
              <Text style={TextStyles.large}>
                {date.format("dddd, MMMM Do")}
              </Text>
            </View>
            {refreshing && <ActivityIndicator size="large" />}
          </Animated.View>
        </>
      );
    } else {
      return (
        <>
          <Animated.Text
            style={[
              TextStyles.large,
              styles.loaderContainer,
              animatedLoaderStyle
            ]}
          >
            {readyForRefresh === 1 ? "release to refresh" : "pull to refresh"}
          </Animated.Text>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.textContainer}>
              <Text style={TextStyles.title}>Feed</Text>
              <Text style={TextStyles.large}>Posts are shown here</Text>
            </View>
            {refreshing && <ActivityIndicator size="large" />}
          </Animated.View>
        </>
      );
    }
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "stretch",
    paddingTop: 5,
    paddingBottom: 20
  },
  textContainer: {
    flex: 1
  },
  loaderContainer: {
    position: "absolute",
    height: 100,
    top: 40,
    left: 0,
    right: 0
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    flex: 1
  },
  header: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: "center"
  }
});
