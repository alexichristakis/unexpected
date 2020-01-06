import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Transition,
  Transitioning,
  TransitioningView
} from "react-native-reanimated";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import BackButtonIcon from "@assets/svg/back_chevron.svg";
import { TextStyles } from "@lib/styles";
import { StackParamList } from "../../App";

export interface NavBarProps {
  transitionRef?: React.Ref<TransitioningView>;
  backButtonText?: string;
  showTitle?: boolean;
  title?: string;
  rightButton?: JSX.Element;
  navigation: NativeStackNavigationProp<StackParamList>;
}

export const NavBar: React.FC<NavBarProps> = React.memo(
  ({
    transitionRef,
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

    const transition = (
      <Transition.Together>
        <Transition.In type="fade" />
        <Transition.Out type="fade" />
        <Transition.Change interpolation="easeInOut" />
      </Transition.Together>
    );

    return (
      <Transitioning.View
        ref={transitionRef}
        transition={transition}
        style={styles.container}
      >
        <TouchableOpacity onPress={onPressBackButton} style={styles.backButton}>
          <BackButtonIcon width={20} height={20} />
          {backButtonText ? (
            <Text style={styles.backButtonText}>{backButtonText}</Text>
          ) : null}
        </TouchableOpacity>
        {showTitle ? <Text style={styles.title}>{title}</Text> : null}
        {rightButton}
      </Transitioning.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  title: {
    flex: 2,
    textAlign: "center",
    ...TextStyles.large
  },
  backButtonText: {
    ...TextStyles.large,
    marginLeft: 5
  }
});
