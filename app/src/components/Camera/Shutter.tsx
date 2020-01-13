import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";

import Haptics from "react-native-haptic-feedback";

import { TouchableScale } from "@components/universal";

import OuterSVG from "@assets/svg/shutter_outer.svg";
import InnerSVG from "@assets/svg/shutter_inner.svg";

export interface ShutterProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}
export const Shutter: React.FC<ShutterProps> = ({ onPress, style }) => {
  const handleOnPress = () => {
    Haptics.trigger("impactMedium");
    onPress();
  };

  return (
    <View style={[style, styles.center]}>
      <View style={styles.container}>
        <View style={StyleSheet.absoluteFill}>
          <OuterSVG width={70} height={70} />
        </View>
        <TouchableScale
          style={StyleSheet.absoluteFill}
          toScale={0.9}
          onPress={handleOnPress}
        >
          <InnerSVG width={50} height={50} />
        </TouchableScale>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    alignItems: "center",
    justifyContent: "center"
  }
});
