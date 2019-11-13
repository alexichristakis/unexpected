import { ParamListBase, RouteProp, useIsFocused } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { StackParamList } from "../App";
import Camera, { Shutter } from "@components/Camera";
import { SCREEN_WIDTH } from "@lib/styles";
import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

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
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) StatusBar.setBarStyle("light-content", true);
    else StatusBar.setBarStyle("dark-content", true);
  }, [isFocused]);

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
      <Camera ref={setCamera} style={styles.camera} />
      <Shutter onPress={onTakePhoto} style={styles.shutter} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  camera: { width: SCREEN_WIDTH, height: 600 },
  shutter: { position: "absolute", bottom: 100 }
});

export default connect(mapStateToProps, mapDispatchToProps)(Capture);
