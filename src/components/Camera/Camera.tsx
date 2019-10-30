import React from "react";
import { StyleSheet } from "react-native";
import { RNCamera } from "react-native-camera";
import { PermissionStatus } from "react-native-permissions";

export interface CameraProps {}
class Camera extends React.Component<CameraProps> {
  state = {
    type: RNCamera.Constants.Type.back
  };

  //   ref: Camera | null;
  private camera = React.createRef<RNCamera>();

  flip = () => {
    const { type } = this.state;
    if (type === RNCamera.Constants.Type.front) {
      this.setState({ type: RNCamera.Constants.Type.back });
    } else {
      this.setState({ type: RNCamera.Constants.Type.front });
    }
  };

  takePhoto = async () => {
    if (this.camera.current) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.current.takePictureAsync(options);

      return data;
    }

    return null;
  };

  render() {
    return <RNCamera ref={this.camera} style={styles.camera} type={RNCamera.Constants.Type.back} />;
  }
}

const styles = StyleSheet.create({
  camera: {
    flex: 1
  }
});

export default Camera;
