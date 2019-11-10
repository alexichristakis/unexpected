import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Input, Button, PendingPostImage } from "@components/universal";
import * as selectors from "@redux/selectors";
import { RootState, ReduxPropsType } from "@redux/types";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import { Formik } from "formik";

const mapStateToProps = (state: RootState) => ({
  image: selectors.currentImage(state),
  sending: selectors.isSendingPost(state)
});
const mapDispatchToProps = {
  sendPost: PostActions.sendPost
};

export interface SharePostOwnProps {}
export type SharePostReduxProps = ReduxPropsType<typeof mapStateToProps, typeof mapDispatchToProps>;
const initialFormValues = { description: "" };
const SharePost: React.FC<SharePostOwnProps & SharePostReduxProps> = React.memo(
  ({ sendPost, image, sending }) => {
    const navigation = useNavigation();

    useEffect(() => {});

    const handleSubmit = (values: typeof initialFormValues) => {
      sendPost(values.description);
    };

    return (
      <Screen style={styles.container}>
        <PendingPostImage source={image} style={{ marginTop: 100 }} width={100} height={130} />
        <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
          {({ values, errors, handleChange, handleSubmit }) => (
            <View style={styles.form}>
              <Input
                size="medium"
                placeholder="anything you'd like to add?"
                value={values.description}
                onChangeText={handleChange("description")}
              />
              <Button title="share post" onPress={handleSubmit} />
            </View>
          )}
        </Formik>
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  form: {
    flex: 1,
    justifyContent: "space-around"
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
)(SharePost);
