import React, { useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "App";
import { View, StyleSheet, Text, TouchableHighlight } from "react-native";
import { SB_HEIGHT, Colors, TextStyles, SCREEN_WIDTH } from "@lib";
import Animated, { interpolate, Extrapolate } from "react-native-reanimated";

export interface SettingsProps {
  offset: Animated.Adaptable<number>;
  navigation: StackNavigationProp<StackParamList>;
}

export interface SettingButtonProps {
  title: string;
  navigation: StackNavigationProp<StackParamList>;
  route: keyof StackParamList;
}

const SettingButton: React.FC<SettingButtonProps> = ({
  navigation,
  title,
  route,
}) => {
  const handleOnPress = useCallback(() => {
    navigation.navigate(route);
  }, []);

  return (
    <TouchableHighlight style={styles.buttonContainer} onPress={handleOnPress}>
      <Text style={styles.label}>{title}</Text>
    </TouchableHighlight>
  );
};

const settings: { title: string; route: keyof StackParamList }[] = [
  { title: "Edit Profile", route: "EDIT_PROFILE" },
  { title: "Settings", route: "SETTINGS" },
  { title: "Share", route: "EDIT_PROFILE" },
];

const Settings: React.FC<SettingsProps> = ({ offset, navigation }) => {
  const containerStyle = {
    transform: [
      {
        translateX: interpolate(offset, {
          inputRange: [-SCREEN_WIDTH - 200, -SCREEN_WIDTH],
          outputRange: [0, 50],
          extrapolate: Extrapolate.CLAMP,
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {settings.map((props, i) => (
        <SettingButton key={i} {...props} {...{ navigation }} />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.darkGray,
    alignItems: "flex-end",
    paddingTop: SB_HEIGHT + 20,
    paddingRight: 20,
  },
  label: {
    ...TextStyles.large,
    color: Colors.lightGray,
  },
  buttonContainer: {
    marginBottom: 20,
  },
});

export default Settings;
