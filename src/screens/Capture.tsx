import React, { useState, useEffect } from "react";
import { StyleSheet, Text, StatusBar } from "react-native";
import { ParamListBase } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import * as selectors from "@redux/selectors";
import { RootState, ReduxPropsType } from "@redux/types";
import { Actions as ImageActions } from "@redux/modules/image";

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

  useEffect(() => {
    const lightenStatusBar = () => {
      StatusBar.setBarStyle("light-content", true);
    };

    navigation.addListener("focus", lightenStatusBar);

    return () => navigation.removeListener("focus", lightenStatusBar);
  }, []);

  const onTakePhoto = async () => {
    if (camera) {
      const data = await camera.takePhoto();
      if (data) {
        /* save to redux */
        takePhoto(data);
      }
    }
  };

  return (
    <Screen style={styles.container}>
      <Text>Capture page!</Text>
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
  camera: { width: 500, height: 600 },
  shutter: { position: "absolute", bottom: 100 }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Capture);
