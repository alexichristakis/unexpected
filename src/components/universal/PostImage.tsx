import React, { useEffect, useState } from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";

import { getHeaders, getPostImageURL } from "@api";
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
