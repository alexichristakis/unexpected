import React, { useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import { Formik } from "formik";
import { Screen } from "react-native-screens";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { Button, Input, NavBar, PendingPostImage } from "@components/universal";
import { TextSizes } from "@lib";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { StackParamList } from "../App";

const connector = connect(
  (state: RootState) => ({
    image: selectors.currentImage(state),
    loading: selectors.isLoadingPost(state),
  }),
  {
    sendPost: PostActions.sendPost,
  }
);

export interface SharePostOwnProps {
  navigation: NativeStackNavigationProp<StackParamList, "SHARE">;
  route: RouteProp<StackParamList, "SHARE">;
}
export type SharePostReduxProps = ConnectedProps<typeof connector>;

const initialFormValues = { description: "" };
const SharePost: React.FC<SharePostOwnProps & SharePostReduxProps> = React.memo(
  ({ sendPost, image, loading, navigation }) => {
    useEffect(() => {});

    const handleSubmit = (values: typeof initialFormValues) => {
      sendPost(values.description);
    };

    return (
      <Screen stackPresentation={"push"} style={styles.container}>
        <NavBar
          showBackButtonText={true}
          backButtonText="Capture"
          navigation={navigation}
        />
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
              <KeyboardAvoidingView
                enabled={true}
                behavior="padding"
                style={styles.form}
              >
                <Input
                  size={TextSizes.medium}
                  style={{ marginTop: 20 }}
                  placeholder="anything you'd like to add?"
                  value={values.description}
                  onChangeText={handleChange("description")}
                />

                <Button
                  style={styles.button}
                  title="share post"
                  loading={loading}
                  onPress={handleSubmit}
                />
              </KeyboardAvoidingView>
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
    paddingTop: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  subContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-around",
  },
  form: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "space-around",
  },
  button: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingHorizontal: 10
  },
  camera: { width: 500, height: 600 },
  shutter: { position: "absolute", bottom: 100 },
});

export default connector(SharePost);
