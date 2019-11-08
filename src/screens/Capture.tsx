import React, { useState, useEffect } from "react";
import { StyleSheet, Text, StatusBar } from "react-native";
import { ParamListBase, useIsFocused } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import * as selectors from "@redux/selectors";
import { RootState, ReduxPropsType } from "@redux/types";
import { Actions as ImageActions } from "@redux/modules/image";
import { routes } from "./index";
import { SCREEN_WIDTH } from "@lib/styles";

const mapStateToProps = (state: RootState) => ({
  cameraPermission: selectors.cameraPermissions(state)
});
const mapDispatchToProps = {
  takePhoto: ImageActions.takePhoto
};

export interface CaptureOwnProps {
  navigation: NativeStackNavigationProp<ParamListBase>;
}
export type CaptureReduxProps = ReduxPropsType<typeof mapStateToProps, typeof mapDispatchToProps>;
const Capture: React.FC<CaptureOwnProps & CaptureReduxProps> = ({ takePhoto, navigation }) => {
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
        navigation.navigate(routes.CreatePost);
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Capture);
