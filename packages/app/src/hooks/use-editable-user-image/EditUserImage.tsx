import React, { useState, useRef, useCallback, useEffect } from "react";
import Animated, { useCode } from "react-native-reanimated";

import { connect, ConnectedProps } from "react-redux";
import {
  ViewStyle,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { mix } from "react-native-redash";

import { RootState, selectors, ImageActions } from "@redux";
import { SCREEN_WIDTH, Colors } from "@lib";
import Camera, { Shutter, CameraRef } from "@components/Camera";
import { UserImage } from "@components/universal";

import CheckLineSVG from "@assets/svg/check_line.svg";
import UndoSVG from "@assets/svg/undo.svg";

const { neq, onChange, call, eq, multiply, sub, add, cond } = Animated;

const CAMERA_SIZE = SCREEN_WIDTH - 40;

const connector = connect(
  (state: RootState) => ({
    photo: selectors.currentImage(state),
    loading: selectors.isUploadingImage(state),
  }),
  {
    clearPhoto: ImageActions.clearPhoto,
    savePhoto: ImageActions.takePhoto,
    uploadPhoto: ImageActions.uploadProfilePhoto,
  }
);

export interface EditUserImageProps {
  onClose: () => void;
  editing: boolean;
  id: string;
  transition: Animated.Node<number>;
  top: Animated.Adaptable<number>;
  left: Animated.Adaptable<number>;
  size: number;
}

export type EditUserImageConnectedProps = ConnectedProps<typeof connector>;

const EditUserImage: React.FC<
  EditUserImageProps & EditUserImageConnectedProps
> = ({
  id,
  onClose,
  editing,
  clearPhoto,
  savePhoto,
  uploadPhoto,
  loading,
  photo,
  transition,
  top,
  left,
  size,
}) => {
  const cameraRef = useRef<CameraRef>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {}, [loading]);

  useCode(
    () => [
      onChange(
        eq(transition, 1),
        call([eq(transition, 1)], ([openNode]) => setOpen(!!openNode))
      ),
    ],
    [id]
  );

  const cameraContainerStyle: Animated.AnimateStyle<ViewStyle> = {
    position: "absolute",
    alignSelf: "center",
    opacity: neq(transition, 0),
    transform: [
      {
        translateX: mix(transition, add(-SCREEN_WIDTH / 2, left, size / 2), 0),
      },
      {
        translateY: mix(transition, add(-CAMERA_SIZE / 2 + size / 2, top), 100),
      },
    ],
  };

  const cameraStyle: Animated.AnimateStyle<ViewStyle> = {
    transform: [{ scale: mix(transition, size / CAMERA_SIZE, 1) }],
  };

  const handleOnPressShutter = useCallback(() => {
    cameraRef.current?.takePhoto().then((photo) => {
      if (photo) savePhoto(photo);
    });
  }, []);

  const handleOnClose = useCallback(() => {
    onClose();
    clearPhoto();
  }, []);

  const handleOnPressUndo = useCallback(() => {
    clearPhoto();
  }, []);

  const handleOnPressConfirm = useCallback(() => {
    //
    uploadPhoto(handleOnClose);
  }, []);

  return (
    <>
      <Animated.View
        pointerEvents={editing ? "auto" : "none"}
        onTouchEnd={handleOnClose}
        style={[styles.overlay, { opacity: transition }]}
      />

      <Animated.View pointerEvents={"none"} style={cameraContainerStyle}>
        <Animated.View style={cameraStyle}>
          {open ? (
            photo ? (
              <Image source={{ uri: photo.uri }} style={styles.image} />
            ) : (
              <Camera
                round
                ref={cameraRef}
                direction={"front"}
                size={CAMERA_SIZE}
              />
            )
          ) : (
            <UserImage {...{ id }} size={CAMERA_SIZE} />
          )}
        </Animated.View>
      </Animated.View>

      <Animated.View
        pointerEvents={editing ? "auto" : "none"}
        style={[styles.buttonContainer, { opacity: transition }]}
      >
        {photo ? (
          loading ? (
            <ActivityIndicator size="large" color={Colors.lightGray} />
          ) : (
            <View style={styles.confirmCancelContainer}>
              <TouchableOpacity onPress={handleOnPressUndo}>
                <UndoSVG width={35} height={35} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleOnPressConfirm}>
                <CheckLineSVG width={35} height={35} />
              </TouchableOpacity>
            </View>
          )
        ) : (
          <Shutter onPress={handleOnPressShutter} />
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.transGray,
  },
  image: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
  },
  confirmCancelContainer: {
    width: 300,
    justifyContent: "space-around",
    flexDirection: "row",
  },
});

export default connector(EditUserImage);
