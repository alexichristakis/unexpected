import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import RNFS from "react-native-fs";
import moment from "moment";
import { connect } from "react-redux";

import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

const mapStateToProps = (state: RootState) => ({
  cache: selectors.profilePhotoCache(state)
});

const mapDispatchToProps = {
  requestCache: ImageActions.requestCache
};

export type UserImageReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

export interface UserImageProps extends UserImageReduxProps {
  phoneNumber: string;
  size: number;
}
export const _UserImage: React.FC<UserImageProps> = React.memo(
  ({ phoneNumber, size, cache, requestCache }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
      if (!cache[phoneNumber]) {
        // call to fetch this image
        requestCache(phoneNumber);
      } else {
        RNFS.exists(cache[phoneNumber].uri).then(res => {
          // if the file doesn't exist or if it's over a day old re-fetch
          if (!res || moment(moment()).diff(cache[phoneNumber].ts, "day") > 1) {
            requestCache(phoneNumber);
          }
        });
      }
    }, []);

    if (cache[phoneNumber]) {
      return (
        <Image
          source={{ uri: cache[phoneNumber].uri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
        />
      );
    } else {
      return (
        <View
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
        />
      );
    }
  },
  (prevProps, nextProps) => {
    const { cache: prevCache } = prevProps;
    const { phoneNumber, cache: nextCache } = nextProps;

    // if we dont have a cache dont rerender
    if (!nextCache || !nextCache[phoneNumber]) return true;

    // if we didnt have a cache but now do rerender
    if (!prevCache[phoneNumber] && !!nextCache[phoneNumber]) return false;

    // if we had a cache but now it's newer rerender
    if (
      prevCache[phoneNumber] &&
      nextCache[phoneNumber].ts > prevCache[phoneNumber].ts
    ) {
      return false;
    }

    // otherwise props are equal
    return true;
  }
);

const styles = StyleSheet.create({
  image: {
    backgroundColor: "gray"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(_UserImage);
