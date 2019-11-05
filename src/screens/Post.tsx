import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import { Formik } from "formik";

import { withApi, ApiProps } from "@api";
import { Actions as PostActions } from "@redux/modules/post";
import { Actions as ImageActions } from "@redux/modules/image";
import { Input, Button } from "@components/universal";
import Camera, { Shutter } from "@components/Camera";

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  onSendPost: PostActions.onSendPost,
  takePhoto: ImageActions.takePhoto
};

export interface PostReduxProps {
  onSendPost: typeof PostActions.onSendPost;
  takePhoto: typeof ImageActions.takePhoto;
}
export interface PostProps extends ApiProps {}

const initialFormValues = { description: "" };
const Post: React.FC<PostProps & PostReduxProps> = ({ onSendPost, takePhoto }) => {
  const [camera, setCamera] = useState<Camera | null>(null);

  const onTakePhoto = async () => {
    if (camera) {
      const data = await camera.takePhoto();

      if (data) takePhoto(data);
    }
  };

  const handleSubmit = (values: typeof initialFormValues) => {
    onSendPost(values.description);
  };

  return (
    <Screen style={styles.container}>
      <Text>Post page!</Text>
      <Camera ref={camera => setCamera(camera)} style={styles.camera} />
      <Button title="take photo" onPress={onTakePhoto} />
      <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
          return (
            <>
              <Input
                placeholder="description"
                value={values.description}
                onChange={handleChange("description")}
              />
              <Button size="large" title={"send post"} onPress={handleSubmit} />
            </>
          );
        }}
      </Formik>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  camera: {
    width: 300,
    maxHeight: 300,
    marginVertical: 20
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Post);
