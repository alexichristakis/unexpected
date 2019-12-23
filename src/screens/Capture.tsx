import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

import { ParamListBase, RouteProp, useIsFocused } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import { useLightStatusBar } from "@hooks";
import { isIPhoneX, SCREEN_WIDTH } from "@lib/styles";
import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";

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

  return (
    <Screen style={styles.container}>
      <View style={styles.background} />
      <Camera ref={setCamera} style={styles.camera} />
      <Shutter onPress={onTakePhoto} style={styles.shutter} />
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
  camera: { width: SCREEN_WIDTH, height: 600 },
  shutter: { position: "absolute", bottom: isIPhoneX ? 80 : 20 }
});

export default connect(mapStateToProps, mapDispatchToProps)(Capture);
