import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, {
  Shutter,
  ToggleFlashModeButton,
  FlipCameraButton
} from "@components/Camera";
import { useLightStatusBar } from "@hooks";
import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";
import { FlashMode, CameraType } from "react-native-camera";

const mapStateToProps = (state: RootState) => ({
  cameraPermission: selectors.cameraPermissions(state)
});
const mapDispatchToProps = {
  takePhoto: ImageActions.takePhoto
};

export interface CaptureOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "CAPTURE">;
  route: RouteProp<StackParamList, "CAPTURE">;
}
export type CaptureReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

const Capture: React.FC<CaptureOwnProps & CaptureReduxProps> = ({
  takePhoto,
  navigation,
  route
}) => {
  const [camera, setCamera] = useState<Camera | null>(null);
  const [flashMode, setFlashMode] = useState<keyof FlashMode>("auto");
  const [direction, setDirection] = useState<keyof CameraType>("back");

  useLightStatusBar();

  const onTakePhoto = async () => {
    if (camera) {
      const data = await camera.takePhoto();
      if (data) {
        /* save to redux */
        takePhoto(data);

        const { nextRoute } = route.params;
        navigation.navigate(nextRoute);
      }
    }
  };

  const onFlipCamera = () => {
    if (camera) {
      if (direction === "back") {
        setDirection("front");
      }

      if (direction === "front") {
        setDirection("back");
      }

      camera.setDirection(direction);
    }
  };

  const onToggleFlashMode = () => {
    if (camera) {
      if (flashMode === "on") {
        setFlashMode("off");
      }

      if (flashMode === "off") {
        setFlashMode("auto");
      }

      if (flashMode === "auto") {
        setFlashMode("on");
      }

      camera.setFlashMode(flashMode);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.background} />
      <Camera ref={setCamera} style={styles.camera} />
      <View style={styles.buttonContainer}>
        <ToggleFlashModeButton mode={flashMode} onPress={onToggleFlashMode} />
        <Shutter onPress={onTakePhoto} style={styles.shutter} />
        <FlipCameraButton mode={direction} onPress={onFlipCamera} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black"
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "black"
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    bottom: 100,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10
  },
  buttonContainer: {
    flexDirection: "row",
    position: "absolute",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    bottom: 100
  },
  shutter: {
    flex: 1
    // position: "absolute",
    // bottom: 100
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Capture);
