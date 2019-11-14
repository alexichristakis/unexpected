import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import { Button, Input, PendingPostImage } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { TextStyles } from "@lib/styles";
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

export type NewProfilePictureReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface NewProfilePictureProps extends NewProfilePictureReduxProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const NewProfilePicture: React.FC<NewProfilePictureProps> = React.memo(
  ({ image, takePhoto, clearPhoto, uploadPhoto, uploading, navigation }) => {
    const [camera, setCamera] = useState<Camera | null>(null);

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
      <Screen style={styles.container}>
        <Text style={[TextStyles.medium, styles.header]}>
          change profile picture:
        </Text>
        <View style={styles.center}>
          <View style={{ flex: 4 }}>
            {image ? (
              <PendingPostImage round={true} size={300} source={image} />
            ) : (
              <Camera front={true} round={true} size={300} ref={setCamera} />
            )}
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            {uploading ? (
              <Text style={TextStyles.medium}>uploading...</Text>
            ) : image ? (
              <View style={styles.buttonContainer}>
                <Button title="try again" onPress={clearPhoto} />
                <Button title="looks good" onPress={onLooksGood} />
              </View>
            ) : (
              <Button title="take photo" onPress={onTakePhoto} />
            )}
          </View>
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
