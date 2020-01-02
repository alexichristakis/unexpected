import React from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from "react-native";

import {
  RNCamera,
  FlashMode,
  TakePictureOptions,
  CameraType
} from "react-native-camera";

export interface CameraProps {
  front?: boolean;
  round?: boolean;
  size?: number;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export interface CameraState {
  direction: keyof CameraType;
  flashMode: keyof FlashMode;
  focus: { x: number; y: number };
  layout: { width: number; height: number };
}

class Camera extends React.Component<CameraProps, CameraState> {
  private camera = React.createRef<RNCamera>();
  constructor(props: CameraProps) {
    super(props);

    const { front } = props;
    this.state = {
      direction: front ? "front" : "back",
      flashMode: "auto",
      focus: { x: 0.5, y: 0.5 },
      layout: { width: 0, height: 0 }
    };
  }

  setDirection = (direction: keyof CameraType) => {
    this.setState({ direction });
  };

  setFlashMode = (flashMode: keyof FlashMode) => {
    this.setState({ flashMode });
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
    const { direction, focus, flashMode } = this.state;
    const { style, round, size } = this.props;

    const cameraStyle: ViewStyle = { ...style };
    if (size && round) {
      cameraStyle.width = size;
      cameraStyle.height = size;
    }

    return (
      <View
        style={[
          { overflow: "hidden", borderRadius: round && !!size ? size / 2 : 0 },
          style
        ]}
      >
        <TouchableWithoutFeedback onPress={this.handleOnPress}>
          <RNCamera
            ref={this.camera}
            onLayout={this.handleCameraLayout}
            flashMode={flashMode}
            autoFocus="on"
            autoFocusPointOfInterest={focus}
            style={[styles.camera, cameraStyle]}
            type={direction}
            captureAudio={false}
          />
        </TouchableWithoutFeedback>
        {__DEV__ && (
          <View
            style={[
              styles.camera,
              cameraStyle,
              { backgroundColor: "red", position: "absolute" }
            ]}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  camera: {
    backgroundColor: "black"
    // flex: 1
  }
});

export default Camera;
