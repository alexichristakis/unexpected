import React, { useEffect, useState } from "react";
import { Image, View, ImageSourcePropType, StyleSheet } from "react-native";

import { connect } from "react-redux";

import { getHeaders, getUserProfileURL } from "@api";
import { useReduxState } from "@hooks";
import * as selectors from "@redux/selectors";
import { Actions as ImageActions } from "@redux/modules/image";
import { ReduxPropsType, RootState } from "@redux/types";

const mapStateToProps = (state: RootState) => ({
  jwt: selectors.jwt(state),
  cache: selectors.profilePhotoCache(state)
});

const mapDispatchToProps = {
  requestCache: ImageActions.requestCache
};

type UserImageReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

export interface UserImageProps extends UserImageReduxProps {
  phoneNumber: string;
  size: number;
}
const UserImage: React.FC<UserImageProps> = React.memo(
  ({ phoneNumber, size, cache, jwt, requestCache }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    // const jwt = useReduxState(selectors.jwt);
    // const cache = useReduxState(selectors.profilePhotoCache);

    let source: ImageSourcePropType = {
      uri: getUserProfileURL(phoneNumber),
      method: "GET",
      headers: getHeaders({ jwt }),
      // cache: "only-if-cached"
      cache: "reload"
    };

    useEffect(() => {
      if (!cache[phoneNumber]) {
        // call to fetch this image
        requestCache(phoneNumber);
      }
    }, []);

    // return (
    //   <Image
    //     //   onLoad={() => setLoaded(true)}
    //     //   onError={() => setError(true)}
    //     source={source}
    // style={[
    //   styles.image,
    //   { width: size, height: size, borderRadius: size / 2 }
    // ]}
    //   />
    // );

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

    return (
      nextCache[phoneNumber] &&
      prevCache[phoneNumber].ts !== nextCache[phoneNumber].ts
    );
  }
);

const styles = StyleSheet.create({
  image: {
    backgroundColor: "gray"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserImage);
