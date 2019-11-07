import React, { useState, useEffect } from "react";
import { Image, View, ImageStyle } from "react-native";
import { TakePictureResponse } from "react-native-camera/types";

import { SCREEN_WIDTH } from "@lib/styles";

export interface PostImageProps {
  width: number;
  height: number;
  source: TakePictureResponse | { uri: string } | null;
  style?: ImageStyle;
}
export const PostImage: React.FC<PostImageProps> = ({
  source,
  style,
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

  if (uri)
    return (
      <Image onLoad={() => setLoading(false)} style={[style, { width, height }]} source={{ uri }} />
    );
  else return <View style={{ width, height, backgroundColor: "gray" }} />;
};
