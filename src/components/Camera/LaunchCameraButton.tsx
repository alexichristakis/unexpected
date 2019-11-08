import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/core";

import * as selectors from "@redux/selectors";
import { routes } from "@screens";
import SVG from "@assets/svg/camera_button.svg";
import { useReduxState } from "@hooks";

export const LaunchCameraButton: React.FC = () => {
  const { enabled, timeOfExpiry } = useReduxState(selectors.camera);
  const navigation = useNavigation();

  // if (enabled)
  return (
    <View pointerEvents={"box-none"} style={styles.container}>
      <TouchableOpacity
        // style={styles.container}
        onPress={() => navigation.navigate(routes.Capture)}
      >
        <SVG width={60} height={60} />
      </TouchableOpacity>
    </View>
  );
  // else return null;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: "center"
  }
});
