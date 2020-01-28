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
  CameraType,
  FlashMode,
  RNCamera,
  TakePictureOptions
} from "react-native-camera";

export interface CameraProps {
  direction?: keyof CameraType;
  flashMode?: keyof FlashMode;
  round?: boolean;
  size?: number;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export interface CameraState {
  focus: { x: number; y: number };
  layout: { width: number; height: number };
}

class Camera extends React.Component<CameraProps, CameraState> {
  state = {
    focus: { x: 0.5, y: 0.5 },
    layout: { width: 0, height: 0 }
  };

  private camera = React.createRef<RNCamera>();

  takePhoto = async () => {
    if (this.camera.current) {
      const mirrorImage = this.props.direction === "front";

      const options: TakePictureOptions = {
        mirrorImage: false,
        quality: 0.5,
        base64: false
      };
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
    const { focus } = this.state;
    const {
      style,
      flashMode = "auto",
      direction = "back",
      round,
      size
    } = this.props;

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
