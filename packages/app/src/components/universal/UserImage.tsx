import React from "react";
import { FlexStyle, StyleSheet } from "react-native";

import FastImage from "react-native-fast-image";
import { getUserProfileURL } from "@api";

export interface UserImageProps {
  id: string;
  size: number;
  style?: Omit<FlexStyle, "overflow">;
}
const UserImage: React.FC<UserImageProps> = React.memo(
  ({ id, size, style = {} }) => {
    return (
      <FastImage
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          ...styles.image,
          ...style,
        }}
        source={{ uri: getUserProfileURL(id) }}
      />
    );
  }
);

const styles = StyleSheet.create({
  image: {
    backgroundColor: "gray",
  },
});

export default UserImage;
