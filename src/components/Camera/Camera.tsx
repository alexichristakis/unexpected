import React from "react";
import {
  StyleSheet,
  View,
  ViewStyle,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  LayoutChangeEvent
} from "react-native";

import { RNCamera, TakePictureOptions } from "react-native-camera";

export interface CameraProps {
  front?: boolean;
  round?: boolean;
  size?: number;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export interface CameraState {
  type: keyof typeof RNCamera.Constants.Type;
  focus: { x: number; y: number };
  layout: { width: number; height: number };
}

class Camera extends React.Component<CameraProps, CameraState> {
  constructor(props: CameraProps) {
    super(props);

    const { front } = props;
    this.state = {
      type: front
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back,
      focus: { x: 0.5, y: 0.5 },
      layout: { width: 0, height: 0 }
    };
  }

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
    const { style, round, size } = this.props;

    let cameraStyle: ViewStyle = { ...style };
    if (size && round) {
      cameraStyle.width = size;
      cameraStyle.height = size;
    }

    return (
      <View
        style={[
          { overflow: "hidden", borderRadius: round && !!size ? size / 2 : 0 }
        ]}
      >
        <TouchableWithoutFeedback onPress={this.handleOnPress}>
          <RNCamera
            ref={this.camera}
            onLayout={this.handleCameraLayout}
            autoFocus="on"
            autoFocusPointOfInterest={focus}
            style={[styles.camera, cameraStyle]}
            type={type}
            captureAudio={false}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  camera: {
    // flex: 1
  }
});

export default Camera;
