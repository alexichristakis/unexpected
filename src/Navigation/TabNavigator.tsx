import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Text, Button } from "react-native";
import { ScreenContainer, Screen } from "react-native-screens";
import Interactable from "react-native-interactable";

import { SCREEN_WIDTH, SCREEN_HEIGHT } from "@lib/styles";
import { BottomTabBarProps } from "react-navigation-tabs/lib/typescript/src/types";

export const createTabNavigator = (routes: {
  [route: string]: React.ComponentType<any>;
}): React.FC => () => {
  const [activeScreen, setActiveScreen] = useState(1);

  return (
    <>
      <ScreenContainer style={styles.container}>
        {Object.values(routes).map((Page, index) => (
          <Page style={styles.page} active={index === activeScreen ? 1 : 0} key={index} />
        ))}
      </ScreenContainer>
      <View style={styles.tabContainer}>
        <Button title="0" onPress={() => setActiveScreen(0)} />
        <Button title="1" onPress={() => setActiveScreen(1)} />
        <Button title="2" onPress={() => setActiveScreen(2)} />
      </View>
    </>
  );
};

export const TabBar: React.FC<BottomTabBarProps> = ({}) => {
  return (
    <View style={styles.tabContainer}>
      <Button title="0" onPress={() => setActiveScreen(0)} />
      <Button title="1" onPress={() => setActiveScreen(1)} />
      <Button title="2" onPress={() => setActiveScreen(2)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
    // flexDirection: "row",
    // width: 3 * SCREEN_WIDTH,
    // height: SCREEN_HEIGHT
  },
  tabContainer: {
    backgroundColor: "gray",
    justifyContent: "space-between",
    flexDirection: "row",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100
  },
  page: {
    flex: 1
    // width: SCREEN_WIDTH,
    // height: SCREEN_HEIGHT/
  }
});

// export default createSwipeNavigator;
