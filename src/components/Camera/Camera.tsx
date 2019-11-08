import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { RNCamera, TakePictureOptions, TakePictureResponse } from "react-native-camera";

export interface CameraProps {
  style?: ViewStyle;
}
class Camera extends React.Component<CameraProps> {
  state = {
    type: RNCamera.Constants.Type.back
  };

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
      const options: TakePictureOptions = { quality: 0.5, base64: false };
      const data = await this.camera.current.takePictureAsync(options);

      return data;
    }

    return null;
  };

  render() {
    const { type } = this.state;
    const { style } = this.props;
    return (
      <RNCamera ref={this.camera} style={[styles.camera, style]} type={type} captureAudio={false} />
    );
  }
}

const styles = StyleSheet.create({
  camera: {
    flex: 1
  }
});

export default Camera;
