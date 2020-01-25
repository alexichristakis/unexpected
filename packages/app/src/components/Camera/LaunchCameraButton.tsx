import React, { useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";

import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { connect } from "react-redux";

import SVG from "@assets/svg/camera_button.svg";
import { TouchableScale } from "@components/universal";
import { NOTIFICATION_MINUTES } from "@lib/constants";
import { Actions as AppActions } from "@redux/modules/app";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../../App";

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

type NavigationProp = NativeStackNavigationProp<StackParamList>;

const _LaunchCameraButton: React.FC<LaunchCameraButtonReduxProps> = React.memo(
  ({ enabled, timeOfExpiry, expireCamera }) => {
    const [visible, setVisible] = useState(false);
    const [scale] = useState(new Animated.Value(0));

    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
      if (enabled && getFill() < 100) {
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
        }).start(() => {
          expireCamera();
          setVisible(false);
        });
      }
    }, [enabled, timeOfExpiry]);

    const handleOnPress = () => navigation.navigate("CAPTURE");

    const getFill = () =>
      100 -
      (moment(timeOfExpiry).diff(moment()) / 1000 / 60 / NOTIFICATION_MINUTES) *
        100;

    const handleAnimationComplete = () => {
      if (enabled && getFill() >= 100) {
        expireCamera();
      }
    };

    if (visible)
      return (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.container, { transform: [{ scale }] }]}
        >
          <TouchableScale onPress={handleOnPress}>
            <SVG style={styles.svg} width={60} height={60} />
            <AnimatedCircularProgress
              duration={moment(timeOfExpiry).diff(moment())}
              prefill={getFill()}
              fill={100}
              rotation={0}
              tintColor="black"
              backgroundColor="transparent"
              size={60}
              width={10}
              onAnimationComplete={handleAnimationComplete}
            />
          </TouchableScale>
        </Animated.View>
      );
    else return null;
  },
  (prevProps, nextProps) =>
    prevProps.enabled === nextProps.enabled &&
    prevProps.timeOfExpiry === nextProps.timeOfExpiry
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
  },
  svg: {
    position: "absolute",
    alignSelf: "center"
  }
});
