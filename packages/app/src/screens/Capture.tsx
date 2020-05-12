import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/core";
import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import Camera, {
  CameraRef,
  FlipCameraButton,
  Shutter,
  ToggleFlashModeButton,
} from "@components/Camera";
import { useLightStatusBar } from "@hooks";
import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { CameraType, FlashMode } from "react-native-camera";
import { StackParamList } from "../App";
import { PostActions } from "@redux/modules";

const mapStateToProps = (state: RootState) => ({
  cameraPermission: selectors.cameraPermissions(state),
});
const mapDispatchToProps = {
  takePhoto: ImageActions.takePhoto,
  sendPost: PostActions.sendPost,
};

export interface CaptureOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "CAPTURE">;
  route: RouteProp<StackParamList, "CAPTURE">;
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type CaptureConnectedProps = ConnectedProps<typeof connector>;

const Capture: React.FC<CaptureOwnProps & CaptureConnectedProps> = ({
  takePhoto,
  sendPost,
  navigation,
}) => {
  const [camera, setCamera] = useState<CameraRef | null>(null);
  const [flashMode, setFlashMode] = useState<keyof FlashMode>("auto");
  const [direction, setDirection] = useState<keyof CameraType>("back");

  useLightStatusBar();

  const onTakePhoto = async () => {
    if (camera) {
      const data = await camera.takePhoto();
      if (data) {
        /* save to redux */
        takePhoto(data);

        // sendPost("this is my cool description");
        navigation.navigate("SHARE");
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
    }
  };

  const onToggleFlashMode = () => {
    if (camera) {
      if (flashMode === "on") {
        setFlashMode("auto");
      }

      if (flashMode === "off") {
        setFlashMode("on");
      }

      if (flashMode === "auto") {
        setFlashMode("off");
      }
    }
  };

  return (
    <Screen stackPresentation={"modal"} style={styles.container}>
      <View style={styles.background} />
      <Camera
        ref={setCamera}
        flashMode={flashMode}
        direction={direction}
        style={styles.camera}
      />
      <View style={styles.buttonContainer}>
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <ToggleFlashModeButton mode={flashMode} onPress={onToggleFlashMode} />
        </View>
        <Shutter onPress={onTakePhoto} style={styles.shutter} />
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <FlipCameraButton mode={direction} onPress={onFlipCamera} />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "black",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    bottom: 100,
    overflow: "hidden",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    position: "absolute",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    bottom: 100,
  },
  shutter: {
    flex: 1,
    // position: "absolute",
    // bottom: 100
  },
});

export default connector(Capture);
