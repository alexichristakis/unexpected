import React from "react";
import {
  StyleSheet,
  ViewStyle,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  LayoutChangeEvent
} from "react-native";

import { RNCamera, TakePictureOptions } from "react-native-camera";

export interface CameraProps {
  style?: ViewStyle;
}
class Camera extends React.Component<CameraProps> {
  state = {
    type: RNCamera.Constants.Type.back,
    focus: { x: 0.5, y: 0.5 },
    layout: { width: 0, height: 0 }
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

  handleCameraLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { layout } = nativeEvent;

    this.setState({ layout });
  };

  handleOnPress = ({ nativeEvent }: GestureResponderEvent) => {
    const { locationX, locationY } = nativeEvent;

    const {
      layout: { width, height }
    } = this.state;

    this.setState({ focus: { x: locationX / width, y: locationY / height } });
  };

  render() {
    const { type, focus } = this.state;
    const { style } = this.props;
    return (
      <TouchableWithoutFeedback onPress={this.handleOnPress}>
        <RNCamera
          ref={this.camera}
          onLayout={this.handleCameraLayout}
          autoFocus="on"
          autoFocusPointOfInterest={focus}
          style={[styles.camera, style]}
          type={type}
          captureAudio={false}
        />
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  camera: {
    flex: 1
  }
});

export default Camera;
