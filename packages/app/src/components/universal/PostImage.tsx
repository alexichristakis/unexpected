import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

import RNFS from "react-native-fs";
import { connect } from "react-redux";

import { Colors, SCREEN_WIDTH } from "@lib/styles";
import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

const mapStateToProps = (state: RootState, props: PostImageProps) => ({
  jwt: selectors.jwt(state),
  cache: selectors.feedPhotoCacheForUser(state, props.phoneNumber)
});

const mapDispatchToProps = {
  requestCache: ImageActions.requestCache
};

export type PostImageReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface PostImageProps {
  phoneNumber: string;
  id: string;
  width: number;
  height: number;
}
export const _PostImage: React.FC<PostImageProps &
  PostImageReduxProps> = React.memo(
  ({ phoneNumber, id, width, height, cache, requestCache }) => {
    useEffect(() => {
      // if the cache doesnt have a record of this photo download it
      if (!cache[id]) {
        requestCache(phoneNumber, id);
      } else {
        // otherwise check to make sure it exists, then download
        RNFS.exists(cache[id].uri).then(res => {
          if (!res) requestCache(phoneNumber, id);
        });
      }
    }, []);

    if (cache[id])
      return (
        <Image
          source={{ uri: cache[id].uri }}
          // source={require("@assets/png/test.png")}
          style={[
            styles.image,
            {
              width,
              height
            }
          ]}
        />
      );

    // loading state
    return (
      <View style={[styles.loadingContainer, { width, height }]}>
        <ActivityIndicator color={Colors.lightGray} size={"large"} />
      </View>
    );
  },
  (prevProps, nextProps) => {
    const { cache: prevCache } = prevProps;
    const { id, cache: nextCache } = nextProps;

    if (!nextCache || !nextCache[id]) return true;

    if (!prevCache[id] && !!nextCache[id]) return false;

    if (prevCache[id] && nextCache[id].ts > prevCache[id].ts) {
      return false;
    }

    // otherwise props are equal
    return true;
  }
);

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
    backgroundColor: Colors.gray
  },
  loadingContainer: {
    backgroundColor: Colors.gray,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(_PostImage);
