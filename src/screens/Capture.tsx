import React, { createRef } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { PermissionStatus } from "react-native-permissions";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";

import * as selectors from "@redux/selectors";
import { AppState } from "@redux/types";

export interface CaptureProps {
  permission: PermissionStatus;
}
class Capture extends React.Component<CaptureProps> {
  state = {};

  private camera: Camera | null;

  takePhoto = async () => {
    if (this.camera) {
      const data = await this.camera.takePhoto();
      if (data) {
        /* upload */
      }
    }
  };

  render() {
    return (
      <Screen style={styles.container}>
        <Text>Capture page!</Text>
        <Camera ref={camera => (this.camera = camera)} />
        <Shutter onPress={this.takePhoto} />
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const mapStateToProps = (state: AppState) => ({
  cameraPermission: selectors.cameraPermissions(state)
});
const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Capture);
