import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import BackButtonIcon from "@assets/svg/back_chevron.svg";
import { SB_HEIGHT, TextStyles } from "@lib/styles";
import { StackParamList } from "../../App";

export interface NavBarProps {
  backButtonText?: string;
  showTitle?: boolean;
  title?: string;
  rightButton?: JSX.Element;
  navigation: NativeStackNavigationProp<StackParamList>;
}

export const NavBar: React.FC<NavBarProps> = ({
  backButtonText,
  showTitle,
  title,
  navigation,
  rightButton
}) => {
  const onPressBackButton = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPressBackButton} style={styles.backButton}>
        <BackButtonIcon width={25} height={25} />
        {backButtonText ? (
          <Text style={styles.backButtonText}>{backButtonText}</Text>
        ) : null}
      </TouchableOpacity>
      {showTitle ? <Text style={styles.title}>{title}</Text> : null}
      {rightButton}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // position: "absolute",
    width: "100%",
    // paddingTop: SB_HEIGHT() + 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center"
  },
  title: {
    ...TextStyles.large
  },
  backButtonText: {
    ...TextStyles.large,
    marginLeft: 5
  }
});
