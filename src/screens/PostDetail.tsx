import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import Camera, { Shutter } from "@components/Camera";
import { Post } from "@components/universal";
import * as selectors from "@redux/selectors";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";
import uuid from "uuid/v4";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state)
});
const mapDispatchToProps = {
  sendPost: PostActions.sendPost,
  takePhoto: ImageActions.takePhoto
};

export type PostReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface PostProps {
  navigation: NativeStackNavigationProp<StackParamList, "POST">;
  route: RouteProp<StackParamList, "POST">;
}

const PostDetail: React.FC<PostProps & PostReduxProps> = ({
  phoneNumber,
  navigation,
  route
}) => {
  const { post } = route.params;

  const handleOnPressName = () => {
    if (phoneNumber === post.userPhoneNumber) {
      navigation.navigate("USER_PROFILE");
    } else {
      navigation.navigate({
        name: "PROFILE",
        key: uuid(),
        params: {
          user: post.user
        }
      });
    }
  };

  return (
    <Screen style={styles.container}>
      <Post onPressName={handleOnPressName} post={post} />
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

export default connect(mapStateToProps, mapDispatchToProps)(PostDetail);
