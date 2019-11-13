import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/core";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import { Button, Input, PendingPostImage } from "@components/universal";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { TextStyles } from "@lib/styles";
import { TakePictureOptions } from "react-native-camera/types";
import { useLightStatusBar } from "@hooks";

const mapStateToProps = (state: RootState) => ({
  image: selectors.currentImage(state),
  sending: selectors.isUploadingImage(state)
});
const mapDispatchToProps = {
  takePhoto: ImageActions.takePhoto,
  clearPhoto: ImageActions.clearPhoto
};

export type NewProfilePictureReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface NewProfilePictureProps extends NewProfilePictureReduxProps {}

const NewProfilePicture: React.FC<NewProfilePictureProps> = React.memo(
  ({ image, takePhoto, clearPhoto }) => {
    const [camera, setCamera] = useState<Camera | null>(null);

    useLightStatusBar();

    useEffect(() => {
      clearPhoto();
    }, []);

    const onTryAgain = () => {
      clearPhoto();
    };

    const onTakePhoto = async () => {
      if (camera) {
        const data = await camera.takePhoto();

        if (data) {
          takePhoto(data);
        }
      }

      return null;
    };

    return (
      <Screen style={styles.container}>
        <Text style={[TextStyles.medium, styles.header]}>
          change profile picture:
        </Text>
        <View style={styles.center}>
          {image ? (
            <PendingPostImage round size={300} source={image} />
          ) : (
            <Camera round size={300} ref={setCamera} />
          )}
          {image ? (
            <View style={styles.buttonContainer}>
              <Button title="try again" onPress={clearPhoto} />
              <Button title="looks good" onPress={clearPhoto} />
            </View>
          ) : (
            <Button title="take photo" onPress={onTakePhoto} />
          )}
        </View>
      </Screen>
    );
  }
  //   }, (prevProps, nextProps) => prevProps.image.
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
    // alignItems: "center"
  },
  buttonContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-around"
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around"
  },
  camera: {
    width: 200,
    height: 200
  },
  header: {
    marginBottom: 40
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewProfilePicture);
