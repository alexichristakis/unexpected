import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/core";

import { StackParamList } from "../../App";
import SVG from "@assets/svg/camera_button.svg";
import { useReduxState } from "@hooks";
import * as selectors from "@redux/selectors";

export const LaunchCameraButton: React.FC = React.memo(() => {
  const [visible, setVisible] = useState(false);
  const [scale] = useState(new Animated.Value(0));

  const { enabled, timeOfExpiry } = useReduxState(selectors.camera);
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  useEffect(() => {
    if (enabled) {
      setVisible(true);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => setVisible(false));
    }
  }, [enabled]);

  const handleOnPress = () =>
    navigation.navigate("CAPTURE", { nextRoute: "SHARE" });

  if (visible)
    return (
      <Animated.View
        pointerEvents={"box-none"}
        style={[styles.container, { transform: [{ scale }] }]}
      >
        <TouchableOpacity onPress={handleOnPress}>
          <SVG width={60} height={60} />
        </TouchableOpacity>
      </Animated.View>
    );
  else return null;
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: "center"
  }
});
