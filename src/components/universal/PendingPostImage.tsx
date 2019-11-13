import React, { useEffect, useState } from "react";
import { Image, ImageStyle, View } from "react-native";
import { TakePictureResponse } from "react-native-camera/types";

import { SCREEN_WIDTH } from "@lib/styles";

export interface PendingPostImageProps {
  width?: number;
  height?: number;
  round?: boolean;
  size?: number;
  source: TakePictureResponse | { uri: string } | null;
  style?: ImageStyle;
}
export const PendingPostImage: React.FC<PendingPostImageProps> = ({
  source,
  style = {},
  round = false,
  size = 0,
  width = SCREEN_WIDTH - 20,
  height
}) => {
  const [loading, setLoading] = useState(true);
  const [uri, setUri] = useState("");

  useEffect(() => {
    if (source && source.uri !== uri) {
      setUri(source.uri);
    }
  });

  let imageStyle: ImageStyle = { ...style, width, height };
  if (size && round) {
    imageStyle.borderRadius = size / 2;
    imageStyle.width = size;
    imageStyle.height = size;
  }

  if (uri)
    return (
      <Image
        onLoad={() => setLoading(false)}
        style={imageStyle}
        source={{ uri }}
      />
    );
  else return <View style={[imageStyle, { backgroundColor: "gray" }]} />;
};
