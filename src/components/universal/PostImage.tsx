import React, { useState, useEffect } from "react";
import { Image, StyleSheet, ImageSourcePropType } from "react-native";

import { getPostImageURL, getHeaders } from "@api";
import { useReduxState } from "@hooks";
import * as selectors from "@redux/selectors";

export interface PostImageProps {
  phoneNumber: string;
  id: string;
  width: number;
  height: number;
}
export const PostImage: React.FC<PostImageProps> = React.memo(
  ({ phoneNumber, id, width, height }) => {
    const jwt = useReduxState(selectors.jwt);

    const source: ImageSourcePropType = {
      uri: getPostImageURL(phoneNumber, id),
      method: "GET",
      headers: getHeaders({ jwt })
    };

    return <Image source={source} style={[styles.image, { width, height }]} />;
  }
);

const styles = StyleSheet.create({
  image: {
    backgroundColor: "gray"
  }
});
