import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import Camera, { CameraRef, Shutter } from "@components/Camera";
import { Button, Input, PendingPostImage } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  image: selectors.currentImage(state),
  uploading: selectors.isUploadingImage(state)
});
const mapDispatchToProps = {
  takePhoto: ImageActions.takePhoto,
  clearPhoto: ImageActions.clearPhoto,
  uploadPhoto: ImageActions.uploadProfilePhoto
};

export type NewProfileConnectedProps = ConnectedProps<typeof connector>;
export interface NewProfilePictureProps extends NewProfileConnectedProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const NewProfilePicture: React.FC<NewProfilePictureProps> = React.memo(
  ({ image, takePhoto, clearPhoto, uploadPhoto, uploading, navigation }) => {
    const [camera, setCamera] = useState<CameraRef | null>(null);

    useLightStatusBar();
    useEffect(() => {
      clearPhoto();
    }, []);

    const onLooksGood = () => {
      uploadPhoto(() => navigation.goBack());
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
      <Screen stackPresentation={"modal"} style={styles.container}>
        {image ? (
          <PendingPostImage
            style={styles.photo}
            round={true}
            size={SCREEN_WIDTH - 40}
            source={image}
          />
        ) : (
          <Camera
            direction="front"
            round={true}
            style={styles.photo}
            size={SCREEN_WIDTH - 40}
            ref={setCamera}
          />
        )}

        {uploading ? (
          <Text style={TextStyles.medium}>uploading...</Text>
        ) : image ? (
          <View style={styles.buttonContainer}>
            <Button
              title="try again"
              style={{ marginBottom: 20 }}
              onPress={clearPhoto}
            />
            <Button
              // style={{ marginLeft: 10 }}
              title="looks good"
              onPress={onLooksGood}
            />
          </View>
        ) : (
          <Button title="take a new profile photo" onPress={onTakePhoto} />
        )}
      </Screen>
    );
  }
  //   }, (prevProps, nextProps) => prevProps.image.
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100
    // alignItems: "center"
  },
  photo: {
    // alignSelf: ""
  },
  buttonContainer: {
    alignSelf: "stretch"
    // justifyContent: "space-around"
  },
  center: {},
  header: {
    marginBottom: 40
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(NewProfilePicture);
