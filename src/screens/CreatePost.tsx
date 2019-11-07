import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ParamListBase } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Input, Button, PostImage } from "@components/universal";
import * as selectors from "@redux/selectors";
import { RootState, ReduxPropsType } from "@redux/types";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import { Formik } from "formik";

const mapStateToProps = (state: RootState) => ({
  image: selectors.currentImage(state)
});
const mapDispatchToProps = {
  sendPost: PostActions.onSendPost
};

export interface CreatePostOwnProps {
  navigation: NativeStackNavigationProp<ParamListBase>;
}
export type CreatePostReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
const initialFormValues = { description: "" };
const CreatePost: React.FC<CreatePostOwnProps & CreatePostReduxProps> = ({
  sendPost,
  image,
  navigation
}) => {
  const handleSubmit = (values: typeof initialFormValues) => {
    sendPost(values.description);
  };

  return (
    <Screen style={styles.container}>
      <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
        {({ values, errors, handleChange, handleSubmit }) => (
          <>
            <View style={styles.headerContent}>
              <PostImage source={image} width={100} height={130} />
              <Input
                size="medium"
                placeholder="anything you'd like to add?"
                value={values.description}
                onChangeText={handleChange("description")}
              />
            </View>
            <Button title="share post" onPress={handleSubmit} />
          </>
        )}
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between"
    // paddingHorizontal: 10
  },
  camera: { width: 500, height: 600 },
  shutter: { position: "absolute", bottom: 100 }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePost);
