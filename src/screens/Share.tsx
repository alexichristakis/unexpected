import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Button, Input, PendingPostImage } from "@components/universal";
import { TextSizes } from "@lib/styles";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Formik } from "formik";

const mapStateToProps = (state: RootState) => ({
  image: selectors.currentImage(state),
  sending: selectors.postLoading(state)
});
const mapDispatchToProps = {
  sendPost: PostActions.sendPost
};

export interface SharePostOwnProps {}
export type SharePostReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
const initialFormValues = { description: "" };
const SharePost: React.FC<SharePostOwnProps & SharePostReduxProps> = React.memo(
  ({ sendPost, image, sending }) => {
    useEffect(() => {});

    const handleSubmit = (values: typeof initialFormValues) => {
      sendPost(values.description);
    };

    return (
      <Screen style={styles.container}>
        <TouchableOpacity
          style={styles.subContainer}
          activeOpacity={1}
          onPress={Keyboard.dismiss}
        >
          <PendingPostImage
            source={image}
            style={{ marginTop: 60 }}
            width={100}
            height={130}
          />
          <Formik initialValues={initialFormValues} onSubmit={handleSubmit}>
            {({ values, errors, handleChange, handleSubmit }) => (
              <>
                <Input
                  size={TextSizes.medium}
                  style={{ marginTop: 20 }}
                  placeholder="anything you'd like to add?"
                  value={values.description}
                  onChangeText={handleChange("description")}
                />
                <KeyboardAvoidingView
                  enabled={true}
                  behavior="padding"
                  style={styles.form}
                >
                  <Button
                    style={styles.button}
                    title="share post"
                    loading={sending}
                    onPress={handleSubmit}
                  />
                </KeyboardAvoidingView>
              </>
            )}
          </Formik>
        </TouchableOpacity>
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
  subContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-around"
  },
  form: {
    flex: 1,
    justifyContent: "space-around"
  },
  button: {
    marginBottom: 20
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between"
    // paddingHorizontal: 10
  },
  camera: { width: 500, height: 600 },
  shutter: { position: "absolute", bottom: 100 }
});

export default connect(mapStateToProps, mapDispatchToProps)(SharePost);
