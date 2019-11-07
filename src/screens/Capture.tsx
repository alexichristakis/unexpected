import React, { createRef } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { PermissionStatus } from "react-native-permissions";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Actions as ImageActions } from "@redux/modules/image";

export interface CaptureProps {
  cameraPermission: PermissionStatus;
  takePhoto: typeof ImageActions.takePhoto;
}
class Capture extends React.Component<CaptureProps> {
  state = {};

  private camera: Camera | null;

  takePhoto = async () => {
    const { takePhoto } = this.props;
    if (this.camera) {
      const data = await this.camera.takePhoto();
      if (data) {
        /* save to redux */
        takePhoto(data);
      }
    }
  };

  render() {
    return (
      <Screen style={styles.container}>
        <Text>Capture page!</Text>
        <Camera ref={camera => (this.camera = camera)} style={styles.camera} />
        <Shutter onPress={this.takePhoto} style={styles.shutter} />
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  camera: { width: 500, height: 600 },
  shutter: { position: "absolute", bottom: 100 }
});

const mapStateToProps = (state: RootState) => ({
  cameraPermission: selectors.cameraPermissions(state)
});
const mapDispatchToProps = {
  takePhoto: ImageActions.takePhoto
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Capture);
