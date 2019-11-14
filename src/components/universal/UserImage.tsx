import React, { useEffect, useState } from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";

import { getHeaders, getUserProfileURL } from "@api";
import { useReduxState } from "@hooks";
import * as selectors from "@redux/selectors";

export interface UserImageProps {
  phoneNumber: string;
  size: number;
}
export const UserImage = ({ phoneNumber, size }: UserImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const jwt = useReduxState(selectors.jwt);

  const source: ImageSourcePropType = {
    uri: getUserProfileURL(phoneNumber),
    method: "GET",
    headers: getHeaders({ jwt }),
    // cache: "only-if-cached"
    cache: "reload"
  };

  useEffect(() => {
    Image.prefetch(getUserProfileURL(phoneNumber))
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  });

  return (
    <Image
      //   onLoad={() => setLoaded(true)}
      //   onError={() => setError(true)}
      source={source}
      style={[
        styles.image,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: "gray"
  }
});
