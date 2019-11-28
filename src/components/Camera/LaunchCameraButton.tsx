import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

import { connect } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AnimatedCircularProgress } from "react-native-circular-progress";

import SVG from "@assets/svg/camera_button.svg";
import { ReduxPropsType, RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { Actions as AppActions } from "@redux/modules/app";
import { StackParamList } from "../../App";
import moment from "moment";
import { TouchableScale } from "@components/universal";

const mapStateToProps = (state: RootState) => ({
  ...selectors.camera(state)
});

const mapDispatchToProps = {
  expireCamera: AppActions.expireCamera
};

export type LaunchCameraButtonReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

const _LaunchCameraButton: React.FC<LaunchCameraButtonReduxProps> = React.memo(
  ({ enabled, timeOfExpiry, expireCamera }) => {
    const [visible, setVisible] = useState(false);
    const [scale] = useState(new Animated.Value(0));
    const [ref, setRef] = useState<AnimatedCircularProgress | null>(null);

    const navigation = useNavigation<
      NativeStackNavigationProp<StackParamList>
    >();

    console.log("render camera button");

    useEffect(() => {
      if (enabled && getFill() < 100) {
        setVisible(true);

        if (ref) {
          ref.animate(
            100,
            moment(timeOfExpiry).diff(moment(), "minutes") * 1000 * 60
          );
        }

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
    }, [enabled, ref]);

    const handleOnPress = () =>
      navigation.navigate("CAPTURE", { nextRoute: "SHARE" });

    const getFill = () => {
      return 100 - (moment(timeOfExpiry).diff(moment(), "seconds") / 60) * 10;
    };

    const expireButton = () => {
      if (
        enabled &&
        timeOfExpiry &&
        moment(timeOfExpiry).diff(moment(), "seconds") < 0
      ) {
        expireCamera();
      }
    };

    if (visible)
      return (
        <Animated.View
          pointerEvents={"box-none"}
          style={[styles.container, { transform: [{ scale }] }]}
        >
          <TouchableScale onPress={handleOnPress}>
            <SVG
              style={{ position: "absolute", alignSelf: "center" }}
              width={60}
              height={60}
            />
            <AnimatedCircularProgress
              ref={setRef}
              prefill={getFill()}
              fill={getFill()}
              rotation={0}
              tintColor="black"
              backgroundColor="transparent"
              size={60}
              width={10}
              onAnimationComplete={expireButton}
            />
          </TouchableScale>
        </Animated.View>
      );
    else return null;
  },
  (prevProps, nextProps) => prevProps.enabled === nextProps.enabled
);

export const LaunchCameraButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(_LaunchCameraButton);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: "center"
  }
});
