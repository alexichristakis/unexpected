import { Formik } from "formik";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import { Button, Input } from "@components/universal";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  sendPost: PostActions.sendPost,
  takePhoto: ImageActions.takePhoto
};

export type PostReduxProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;
export interface PostProps {}

const initialFormValues = { description: "" };
const Post: React.FC<PostProps & PostReduxProps> = ({
  sendPost,
  takePhoto
}) => {
  const [camera, setCamera] = useState<Camera | null>(null);

  const onTakePhoto = async () => {
    if (camera) {
      const data = await camera.takePhoto();

      if (data) takePhoto(data);
    }
  };

  const handleSubmit = (values: typeof initialFormValues) => {
    sendPost(values.description);
  };

  return (
    <Screen style={styles.container}>
      <Text>Post page!</Text>
      <Camera ref={setCamera} style={styles.camera} />
      <Button title="take photo" onPress={onTakePhoto} />
      <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
        }) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(Post);
