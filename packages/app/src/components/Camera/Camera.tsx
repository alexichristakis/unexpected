import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";

import {
  CameraType,
  FlashMode,
  RNCamera,
  TakePictureOptions,
  TakePictureResponse,
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
  focus: { x: number; y: number; autoExposure: boolean };
  layout: { width: number; height: number };
}

export type CameraRef = {
  takePhoto: () => Promise<TakePictureResponse | null>;
};

const Camera = React.memo(
  forwardRef<CameraRef, CameraProps>(
    ({ style, flashMode = "auto", direction = "back", round, size }, ref) => {
      const [focus, setFocus] = useState({
        x: 0.5,
        y: 0.5,
        autoExposure: true,
      });
      const [layout, setLayout] = useState({ width: 0, height: 0 });
      const camera = useRef<RNCamera>();

      useImperativeHandle(ref, () => ({
        takePhoto: async () => {
          if (camera.current) {
            const options: TakePictureOptions = {
              quality: 0.5,
              base64: false,
            };

            return camera.current.takePictureAsync(options);
          }

          return null;
        },
      }));

      const handleOnPress = ({ nativeEvent }: GestureResponderEvent) => {
        const { locationX, locationY } = nativeEvent;

        const { width, height } = layout;

        setFocus({
          x: locationX / width,
          y: locationY / height,
          autoExposure: true,
        });
      };

      const handleOnLayout = ({ nativeEvent }: LayoutChangeEvent) =>
        setLayout(nativeEvent.layout);

      const cameraStyle: ViewStyle = { ...style };
      if (size && round) {
        cameraStyle.width = size;
        cameraStyle.height = size;
      }

      return (
        <View
          style={[
            {
              overflow: "hidden",
              borderRadius: round && !!size ? size / 2 : 0,
              ...cameraStyle,
            },
            style,
          ]}
        >
          <TouchableWithoutFeedback onPress={handleOnPress}>
            <RNCamera
              ref={camera as any}
              onLayout={handleOnLayout}
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
                { backgroundColor: "red", position: "absolute" },
              ]}
            />
          )}
        </View>
      );
    }
  )
);

const styles = StyleSheet.create({
  camera: {
    backgroundColor: "black",
  },
});

export default Camera;
